import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { CURSOR_MARKER, TUI } from "@earendil-works/pi-tui";

export default function (pi: ExtensionAPI) {
	const extractCursorPosition = TUI.prototype["extractCursorPosition"];

	pi.on("session_start", () => {
		TUI.prototype["extractCursorPosition"] = function (lines, height) {
			if (this.getShowHardwareCursor()) {
				for (let i = lines.length - 1, top = Math.max(0, lines.length - height); i >= top; i--) {
					if (!lines[i].includes(CURSOR_MARKER)) continue;
					lines[i] = lines[i].replace(`${CURSOR_MARKER}\x1b[7m`, CURSOR_MARKER);
					break;
				}
			}
			return extractCursorPosition.call(this, lines, height);
		};
	});

	pi.on("session_shutdown", () => {
		TUI.prototype["extractCursorPosition"] = extractCursorPosition;
	});
}
