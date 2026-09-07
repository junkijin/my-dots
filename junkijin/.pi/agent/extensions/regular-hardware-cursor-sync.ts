import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TuiMainScreen } from "@earendil-works/pi-tui";

const END_SYNCHRONIZED_OUTPUT = "\x1b[?2026l";

// protected 메서드지만 런타임 prototype에는 존재한다.
const mainScreen = TuiMainScreen.prototype as unknown as {
	doRender: (this: TuiMainScreen) => void;
};

/**
 * regular renderer의 repaint와 hardware-cursor 복원을 하나의 synchronized frame으로 묶는다.
 * pi 0.84.4는 repaint frame을 먼저 닫아서 WezTerm이 중간 cursor 위치를 노출할 수 있다.
 */
export default function (pi: ExtensionAPI) {
	if (!Object.hasOwn(mainScreen, "doRender")) return; // pi 내부 구조 변경 시 아무것도 하지 않음

	let original: typeof mainScreen.doRender | undefined;
	let patched: typeof mainScreen.doRender | undefined;

	pi.on("session_start", () => {
		if (original) return; // 중복 패치 방지
		const prev = (original = mainScreen.doRender);

		patched = function () {
			if (!this.getShowHardwareCursor()) {
				prev.call(this);
				return;
			}

			const terminal = this.terminal;
			const write = terminal.write;
			let deferredEnd = false;

			terminal.write = function (data) {
				if (!data.includes(END_SYNCHRONIZED_OUTPUT)) {
					write.call(terminal, data);
					return;
				}

				deferredEnd = true;
				const withoutEnd = data.replaceAll(END_SYNCHRONIZED_OUTPUT, "");
				if (withoutEnd) write.call(terminal, withoutEnd);
			};

			try {
				prev.call(this);
			} finally {
				terminal.write = write;
				if (deferredEnd) write.call(terminal, END_SYNCHRONIZED_OUTPUT);
			}
		};
		mainScreen.doRender = patched;
	});

	pi.on("session_shutdown", () => {
		if (original && mainScreen.doRender === patched) {
			mainScreen.doRender = original;
		}
		original = undefined;
		patched = undefined;
	});
}
