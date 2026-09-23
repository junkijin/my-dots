import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { CURSOR_MARKER, type TUI, TuiMainScreen } from "@earendil-works/pi-tui";

// Editor와 Input은 CURSOR_MARKER 바로 뒤에 반전(\x1b[7m)으로 가짜 커서를 그린다.
const SOFTWARE_CURSOR = `${CURSOR_MARKER}\x1b[7m`;

// 두 렌더러가 공유하는 TuiBase는 export되지 않아 prototype chain으로 꺼낸다.
const base = Object.getPrototypeOf(TuiMainScreen.prototype) as {
	extractCursorPosition(this: TUI, lines: string[], height: number): unknown;
};

export default function (pi: ExtensionAPI) {
	const original = base.extractCursorPosition;

	pi.on("session_start", () => {
		base.extractCursorPosition = function (lines, height) {
			if (this.getShowHardwareCursor()) {
				for (let row = Math.max(0, lines.length - height); row < lines.length; row++) {
					lines[row] = lines[row].replaceAll(SOFTWARE_CURSOR, CURSOR_MARKER);
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
