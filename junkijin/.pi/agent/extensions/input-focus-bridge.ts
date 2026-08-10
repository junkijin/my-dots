import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type Component, type Focusable, type Input, SettingsList } from "@earendil-works/pi-tui";

/** SettingsList with its private internals exposed and Focusable made optional. */
type Host = Component &
	Partial<Focusable> & {
		searchInput?: Input;
		submenuComponent?: unknown;
	};

export default function (pi: ExtensionAPI) {
	let restore: (() => void) | undefined;

	pi.on("session_start", (_event, ctx) => {
		const prototype = SettingsList.prototype as unknown as Host;
		if (ctx.mode !== "tui" || restore || "focused" in prototype) return;

		const render = prototype.render;
		const inputs = new Set<Input>();
		const patchedRender: typeof render = function (this: Host, width) {
			const input = this.searchInput;
			if (input) {
				input.focused = this.focused === true && this.submenuComponent == null;
				inputs.add(input);
			}
			return render.call(this, width);
		};

		// TUI's isFocusable checks `"focused" in component`, so a data property suffices
		prototype.focused = false;
		prototype.render = patchedRender;

		restore = () => {
			for (const input of inputs) input.focused = false;
			if (prototype.render === patchedRender) prototype.render = render;
			if (Object.getOwnPropertyDescriptor(prototype, "focused")?.value === false) delete prototype.focused;
		};
	});

	pi.on("session_shutdown", () => {
		restore?.();
		restore = undefined;
	});
}
