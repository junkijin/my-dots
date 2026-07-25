import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Input } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI): void {
	let cleanup: (() => void) | undefined;

	pi.on("session_start", () => {
		cleanup?.();
		const render = Input.prototype.render;
		const patched: typeof render = function (width) {
			const focused = this.focused;
			this.focused = true;
			try {
				return render.call(this, width);
			} finally {
				this.focused = focused;
			}
		};
		Input.prototype.render = patched;
		cleanup = () => {
			if (Input.prototype.render === patched) Input.prototype.render = render;
		};
	});

	pi.on("session_shutdown", () => cleanup?.());
}
