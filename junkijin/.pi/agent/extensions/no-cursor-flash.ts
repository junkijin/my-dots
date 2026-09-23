import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { TuiMainScreen } from "@earendil-works/pi-tui";

const END_SYNCHRONIZED_OUTPUT = "\x1b[?2026l";

// doRender는 protected라서 prototype 타입만 넓힌다.
const screen = TuiMainScreen.prototype as unknown as {
	doRender: (this: TuiMainScreen) => void;
};

/**
 * regular renderer는 화면 프레임을 닫은 뒤 hardware cursor를 옮긴다.
 * 렌더 중에 나온 프레임 종료 시퀀스를 렌더가 끝날 때까지 미뤄 커서 이동까지 한 프레임에 담는다.
 */
export default function (pi: ExtensionAPI) {
	const doRender = screen.doRender;

	pi.on("session_start", () => {
		screen.doRender = function () {
			const terminal = this.terminal;
			const write = terminal.write;
			let deferred = false;

			terminal.write = (data) => {
				if (data.includes(END_SYNCHRONIZED_OUTPUT)) {
					deferred = true;
					data = data.replaceAll(END_SYNCHRONIZED_OUTPUT, "");
				}
				write.call(terminal, data);
			};

			try {
				doRender.call(this);
			} finally {
				terminal.write = write;
				if (deferred) write.call(terminal, END_SYNCHRONIZED_OUTPUT);
			}
		};
	});

	// reload와 세션 교체는 shutdown → factory → session_start 순서로 진행된다.
	pi.on("session_shutdown", () => {
		screen.doRender = doRender;
	});
}
