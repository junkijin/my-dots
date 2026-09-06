import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type Component, type Input, SettingsList } from "@earendil-works/pi-tui";

/** SettingsList's private state and the focus flag added by this extension. */
type Host = Component & {
	focused?: boolean;
	searchInput?: Input;
	submenuComponent: Component | null;
};

export default function (pi: ExtensionAPI) {
	let restore: (() => void) | undefined;

	pi.on("session_start", (_event, ctx) => {
		const prototype = SettingsList.prototype as unknown as Host;
		if (ctx.mode !== "tui" || "focused" in prototype) return;

		const render = prototype.render;
		const inputs = new Set<Input>();

		// TUI's isFocusable checks `"focused" in component`, so a data property suffices.
		prototype.focused = false;
		prototype.render = function (this: Host, width) {
			const input = this.searchInput;
			if (input) {
				input.focused = this.focused === true && this.submenuComponent == null;
				inputs.add(input);
			}
			return render.call(this, width);
		};

		restore = () => {
			for (const input of inputs) input.focused = false;
			prototype.render = render;
			delete prototype.focused;
		};
	});

	pi.on("session_shutdown", () => {
		restore?.();
		restore = undefined;
	});
}
