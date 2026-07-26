import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type Input, SettingsList } from "@earendil-works/pi-tui";

type Host = {
	focused?: boolean;
	render(width: number): string[];
	searchInput?: Input;
	submenuComponent?: unknown;
};

export default function (pi: ExtensionAPI) {
	let restore: (() => void) | undefined;

	pi.on("session_start", (_event, ctx) => {
		const prototype = SettingsList.prototype as Host;
		if (ctx.mode !== "tui" || restore || "focused" in prototype) return;

		const render = prototype.render;
		const focus = new WeakMap<Host, boolean>();
		const inputs = new Set<Input>();

		const sync = (host: Host) => {
			const input = host.searchInput;
			if (!input) return;

			input.focused = (focus.get(host) ?? false) && host.submenuComponent == null;
			inputs.add(input);
		};
		const getFocused = function (this: Host) {
			return focus.get(this) ?? false;
		};
		const setFocused = function (this: Host, value: boolean) {
			focus.set(this, Boolean(value));
			sync(this);
		};
		const patchedRender = function (this: Host, width: number) {
			sync(this);
			return render.call(this, width);
		};

		Object.defineProperty(prototype, "focused", {
			configurable: true,
			get: getFocused,
			set: setFocused,
		});
		prototype.render = patchedRender;

		restore = () => {
			for (const input of inputs) input.focused = false;
			if (prototype.render === patchedRender) prototype.render = render;

			const descriptor = Object.getOwnPropertyDescriptor(prototype, "focused");
			if (descriptor?.get === getFocused && descriptor.set === setFocused) delete prototype.focused;
		};
	});

	pi.on("session_shutdown", () => {
		restore?.();
		restore = undefined;
	});
}
