import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { CURSOR_MARKER, type TUI, TuiAltScreen } from "@earendil-works/pi-tui";

// TuiAltScreen/TuiMainScreen이 공유하는 TuiBase가 extractCursorPosition을 소유한다.
const base = Object.getPrototypeOf(TuiAltScreen.prototype) as {
	extractCursorPosition: (this: TUI, lines: string[], height: number) => unknown;
};

export default function (pi: ExtensionAPI) {
	const original = base.extractCursorPosition;

	pi.on("session_start", () => {
		base.extractCursorPosition = function (lines, height) {
			if (this.getShowHardwareCursor()) {
				const top = Math.max(0, lines.length - height);
				const index = lines.findLastIndex((line, index) => index >= top && line.includes(CURSOR_MARKER));
				if (index >= 0) {
					lines[index] = lines[index].replace(`${CURSOR_MARKER}\x1b[7m`, CURSOR_MARKER);
				}
			}
			return original.call(this, lines, height);
		};
	});

	// reload와 세션 교체는 shutdown → factory → session_start 순서로 진행된다.
	pi.on("session_shutdown", () => {
		base.extractCursorPosition = original;
	});
}
