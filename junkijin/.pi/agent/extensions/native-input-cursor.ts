import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Input } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI) {
	const render = Input.prototype["render"];

	pi.on("session_start", () => {
		Input.prototype.render = function (width) {
			const focused = this.focused;
			this.focused = true;
			try {
				return render.call(this, width);
			} finally {
				this.focused = focused;
			}
		};
	});

	pi.on("session_shutdown", () => {
		Input.prototype["render"] = render;
	});
}
