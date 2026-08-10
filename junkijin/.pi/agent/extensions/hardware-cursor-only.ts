import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { CURSOR_MARKER, type TUI, TuiAltScreen } from "@earendil-works/pi-tui";

// TuiAltScreen/TuiMainScreen이 공유하는 TuiBase가 extractCursorPosition을 소유한다.
const base = Object.getPrototypeOf(TuiAltScreen.prototype) as {
	extractCursorPosition: (this: TUI, lines: string[], height: number) => unknown;
};

export default function (pi: ExtensionAPI) {
	if (!Object.hasOwn(base, "extractCursorPosition")) return; // pi 내부 구조 변경 시 아무것도 하지 않음

	let original: typeof base.extractCursorPosition | undefined;

	pi.on("session_start", () => {
		if (original) return; // 중복 패치 방지
		const prev = (original = base.extractCursorPosition);
		base.extractCursorPosition = function (lines, height) {
			if (this.getShowHardwareCursor()) {
				for (let i = lines.length - 1, top = Math.max(0, lines.length - height); i >= top; i--) {
					const line = lines[i];
					if (!line?.includes(CURSOR_MARKER)) continue;
					lines[i] = line.replace(`${CURSOR_MARKER}\x1b[7m`, CURSOR_MARKER);
					break;
				}
			}
			return prev.call(this, lines, height);
		};
	});

	// /reload, 세션 교체(new/resume/fork), 종료 시 원본 복원.
	// reload 순서가 shutdown(구 runner) → factory 재실행 → session_start(신 runner)이므로 패치가 겹겹이 쌓이지 않는다.
	pi.on("session_shutdown", () => {
		if (!original) return;
		base.extractCursorPosition = original;
		original = undefined;
	});
}
