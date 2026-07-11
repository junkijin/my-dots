import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { CURSOR_MARKER, Editor, SettingsList, TUI, isFocusable, type Component, type Focusable } from "@earendil-works/pi-tui";

const PATCH_STATE_KEY = "__junkijin_pi_no_software_cursor_patch__";
const PATCHED_METHOD_KEY = "__junkijin_pi_hardware_cursor_patch_owner__";
const PATCH_OWNER = "junkijin.hardware-cursor/v1";
const REVERSE_SGR = "\x1b\\[(?:\\d+;)*0*7(?:;\\d+)*m";
const SOFTWARE_CURSOR_START = "\x1b[7m";
const MARKER = escapeRegExp(CURSOR_MARKER);
const MARKED_SOFTWARE_CURSOR = new RegExp(`(${MARKER})(${REVERSE_SGR})|(${REVERSE_SGR})(${MARKER})`, "g");

type RenderFn<T> = (this: T, width: number, ...args: unknown[]) => string[];
type CursorPosition = { row: number; col: number } | null;

type EditorLike = Editor & {
	render: RenderFn<EditorLike>;
};

type SettingsListLike = SettingsList & {
	searchInput?: Component | null;
	submenuComponent?: Component | null;
	render: RenderFn<SettingsListLike>;
};

type TUILike = TUI & {
	extractCursorPosition: (lines: string[], height: number) => CursorPosition;
	getShowHardwareCursor?: () => boolean;
	setFocus: (component: Component | null) => void;
};

type CursorPatchState = {
	refCount: number;
	focusedSettingsLists: WeakSet<SettingsListLike>;
	focusedSettingsListByTui: WeakMap<TUI, SettingsListLike>;
	restore: () => void;
};

type PatchAcquisition = { acquired: true } | { acquired: false; reason: string };

type PreparedPatch = {
	label: string;
	current: () => unknown;
	apply: () => void;
	restore: () => void;
	replacement: Function;
};

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPatchStateStore(): typeof globalThis & { [PATCH_STATE_KEY]?: CursorPatchState } {
	return globalThis as typeof globalThis & { [PATCH_STATE_KEY]?: CursorPatchState };
}

function getPatchState(): CursorPatchState | undefined {
	const state = getPatchStateStore()[PATCH_STATE_KEY];
	return isCursorPatchState(state) ? state : undefined;
}

function isCursorPatchState(value: unknown): value is CursorPatchState {
	if (!value || typeof value !== "object") return false;
	const state = value as Partial<CursorPatchState>;
	return (
		typeof state.refCount === "number" &&
		state.focusedSettingsLists instanceof WeakSet &&
		state.focusedSettingsListByTui instanceof WeakMap &&
		typeof state.restore === "function"
	);
}

function validatePatchTarget(target: object, methodName: string, label: string): string | undefined {
	const descriptor = Object.getOwnPropertyDescriptor(target, methodName);
	if (!descriptor || typeof descriptor.value !== "function") {
		return `${label} is unavailable in this pi-tui version`;
	}
	if (!descriptor.writable) {
		return `${label} is not writable`;
	}

	const method = descriptor.value as Function & { [PATCHED_METHOD_KEY]?: unknown };
	if (method[PATCHED_METHOD_KEY] !== undefined || method.name !== methodName) {
		return `${label} appears to have already been patched`;
	}

	return undefined;
}

function markPatchedMethod<T extends Function>(method: T): T {
	Object.defineProperty(method, PATCHED_METHOD_KEY, {
		value: PATCH_OWNER,
		configurable: false,
		enumerable: false,
		writable: false,
	});
	return method;
}

function stripReverseVideo(sgr: string): string {
	const params = sgr
		.slice(2, -1)
		.split(";")
		.filter((param) => Number(param) !== 7);
	return params.length > 0 ? `\x1b[${params.join(";")}m` : "";
}

function stripMarkedSoftwareCursor(lines: string[]): void {
	for (let index = 0; index < lines.length; index += 1) {
		lines[index] = lines[index].replace(MARKED_SOFTWARE_CURSOR, (_match, markerBefore, sgrAfter, sgrBefore) => {
			return markerBefore ? `${CURSOR_MARKER}${stripReverseVideo(sgrAfter)}` : `${stripReverseVideo(sgrBefore)}${CURSOR_MARKER}`;
		});
	}
}

function insertMarkerBeforeSoftwareCursor(lines: string[]): void {
	if (lines.some((line) => line.includes(CURSOR_MARKER))) return;

	for (let index = 0; index < lines.length; index += 1) {
		const cursorStartIndex = lines[index].indexOf(SOFTWARE_CURSOR_START);
		if (cursorStartIndex === -1) continue;
		lines[index] = `${lines[index].slice(0, cursorStartIndex)}${CURSOR_MARKER}${lines[index].slice(cursorStartIndex)}`;
		return;
	}
}

function wrapEditorRender(render: RenderFn<EditorLike>): RenderFn<EditorLike> {
	return function wrappedEditorRender(this: EditorLike, width: number, ...args: unknown[]): string[] {
		const lines = render.call(this, width, ...args);

		// pi-tui intentionally suppresses CURSOR_MARKER while autocomplete is visible because
		// the software cursor still shows the edit position. This extension removes that
		// software cursor, so re-add the marker before stripping reverse-video in TUI render.
		if (this.focused && this.isShowingAutocomplete()) insertMarkerBeforeSoftwareCursor(lines);

		return lines;
	};
}

function withFocusedChild<T>(settingsList: SettingsListLike, render: () => T): T {
	const snapshots: Array<[Focusable, boolean]> = [];
	const focus = (component: Component | null | undefined, focused: boolean) => {
		if (!isFocusable(component)) return;
		snapshots.push([component, component.focused]);
		component.focused = focused;
	};

	focus(settingsList.searchInput, !settingsList.submenuComponent);
	focus(settingsList.submenuComponent, true);

	try {
		return render();
	} finally {
		for (const [component, focused] of snapshots.reverse()) component.focused = focused;
	}
}

function wrapSettingsListRender(render: RenderFn<SettingsListLike>): RenderFn<SettingsListLike> {
	return function wrappedSettingsListRender(this: SettingsListLike, width: number, ...args: unknown[]): string[] {
		const renderList = () => render.call(this, width, ...args);
		return getPatchState()?.focusedSettingsLists.has(this) ? withFocusedChild(this, renderList) : renderList();
	};
}

function wrapCursorExtraction(extractCursorPosition: TUILike["extractCursorPosition"]): TUILike["extractCursorPosition"] {
	return function wrappedExtractCursorPosition(this: TUILike, lines: string[], height: number): CursorPosition {
		if (this.getShowHardwareCursor?.() ?? process.env.PI_HARDWARE_CURSOR === "1") {
			stripMarkedSoftwareCursor(lines);
		}
		return extractCursorPosition.call(this, lines, height);
	};
}

function wrapTuiSetFocus(setFocus: TUILike["setFocus"]): TUILike["setFocus"] {
	return function wrappedSetFocus(this: TUILike, component: Component | null): void {
		setFocus.call(this, component);

		const patchState = getPatchState();
		if (!patchState) return;

		const previous = patchState.focusedSettingsListByTui.get(this);
		if (previous) patchState.focusedSettingsLists.delete(previous);

		if (component instanceof SettingsList) {
			const settingsList = component as SettingsListLike;
			patchState.focusedSettingsLists.add(settingsList);
			patchState.focusedSettingsListByTui.set(this, settingsList);
		} else {
			patchState.focusedSettingsListByTui.delete(this);
		}
	};
}

function acquirePatch(): PatchAcquisition {
	const store = getPatchStateStore();
	const existing = store[PATCH_STATE_KEY];
	if (existing !== undefined) {
		if (!isCursorPatchState(existing)) {
			return { acquired: false, reason: "the global patch state is owned by another extension" };
		}
		existing.refCount += 1;
		return { acquired: true };
	}

	const editorProto = Editor.prototype as EditorLike;
	const settingsListProto = SettingsList.prototype as SettingsListLike;
	const tuiProto = TUI.prototype as unknown as TUILike;
	const validationError = [
		validatePatchTarget(editorProto, "render", "Editor.render"),
		validatePatchTarget(settingsListProto, "render", "SettingsList.render"),
		validatePatchTarget(tuiProto, "extractCursorPosition", "TUI.extractCursorPosition"),
		validatePatchTarget(tuiProto, "setFocus", "TUI.setFocus"),
	].find((error): error is string => error !== undefined);
	if (validationError) return { acquired: false, reason: validationError };

	const originalEditorRender = editorProto.render;
	const originalSettingsListRender = settingsListProto.render;
	const originalExtractCursorPosition = tuiProto.extractCursorPosition;
	const originalTuiSetFocus = tuiProto.setFocus;
	const editorRender = markPatchedMethod(wrapEditorRender(originalEditorRender));
	const settingsListRender = markPatchedMethod(wrapSettingsListRender(originalSettingsListRender));
	const extractCursorPosition = markPatchedMethod(wrapCursorExtraction(originalExtractCursorPosition));
	const tuiSetFocus = markPatchedMethod(wrapTuiSetFocus(originalTuiSetFocus));
	const patches: PreparedPatch[] = [
		{
			label: "Editor.render",
			current: () => editorProto.render,
			apply: () => {
				editorProto.render = editorRender;
			},
			restore: () => {
				editorProto.render = originalEditorRender;
			},
			replacement: editorRender,
		},
		{
			label: "SettingsList.render",
			current: () => settingsListProto.render,
			apply: () => {
				settingsListProto.render = settingsListRender;
			},
			restore: () => {
				settingsListProto.render = originalSettingsListRender;
			},
			replacement: settingsListRender,
		},
		{
			label: "TUI.extractCursorPosition",
			current: () => tuiProto.extractCursorPosition,
			apply: () => {
				tuiProto.extractCursorPosition = extractCursorPosition;
			},
			restore: () => {
				tuiProto.extractCursorPosition = originalExtractCursorPosition;
			},
			replacement: extractCursorPosition,
		},
		{
			label: "TUI.setFocus",
			current: () => tuiProto.setFocus,
			apply: () => {
				tuiProto.setFocus = tuiSetFocus;
			},
			restore: () => {
				tuiProto.setFocus = originalTuiSetFocus;
			},
			replacement: tuiSetFocus,
		},
	];
	const patchState: CursorPatchState = {
		refCount: 1,
		focusedSettingsLists: new WeakSet(),
		focusedSettingsListByTui: new WeakMap(),
		restore() {
			for (const patch of [...patches].reverse()) {
				if (patch.current() !== patch.replacement) continue;
				try {
					patch.restore();
				} catch {
					// A later extension may have made the prototype non-writable. Do not
					// disturb methods that are no longer exactly our wrappers.
				}
			}
		},
	};

	const applied: PreparedPatch[] = [];
	try {
		store[PATCH_STATE_KEY] = patchState;
		for (const patch of patches) {
			applied.push(patch);
			patch.apply();
			if (patch.current() !== patch.replacement) throw new Error(`failed to install ${patch.label}`);
		}
	} catch (error) {
		for (const patch of applied.reverse()) {
			if (patch.current() !== patch.replacement) continue;
			try {
				patch.restore();
			} catch {
				// Best-effort rollback; the warning below keeps the failure visible.
			}
		}
		delete store[PATCH_STATE_KEY];
		const reason = error instanceof Error ? error.message : "unknown prototype assignment failure";
		return { acquired: false, reason };
	}

	return { acquired: true };
}

function releasePatch(): void {
	const store = getPatchStateStore();
	const patchState = getPatchState();
	if (!patchState) return;

	patchState.refCount -= 1;
	if (patchState.refCount > 0) return;

	patchState.restore();
	delete store[PATCH_STATE_KEY];
}

export default function (pi: ExtensionAPI) {
	const acquisition = acquirePatch();
	if (!acquisition.acquired) {
		pi.on("session_start", (_event, ctx) => {
			ctx.ui.notify(`Hardware cursor patch disabled: ${acquisition.reason}`, "warning");
		});
	}

	pi.on("session_shutdown", async () => {
		if (acquisition.acquired) releasePatch();
	});
}
