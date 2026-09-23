import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { type Input, SettingsList } from "@earendil-works/pi-tui";

type Host = { focused?: boolean; searchInput?: Input };

// SettingsList는 Focusable이 아니라서 TUI가 포커스를 줘도 검색 Input이 CURSOR_MARKER를 내지 않는다.
// docs/tui.md의 "Container Components with Embedded Inputs" 패턴대로 포커스를 검색 Input에 넘긴다.
const prototype = SettingsList.prototype as unknown as Host;

const focused: PropertyDescriptor & ThisType<Host> = {
	configurable: true,
	get() {
		return this.searchInput?.focused ?? false;
	},
	set(value: boolean) {
		if (this.searchInput) this.searchInput.focused = value;
	},
};

export default function (pi: ExtensionAPI) {
	pi.on("session_start", () => {
		// pi-tui가 직접 Focusable을 구현하면 그쪽을 쓴다.
		if (!("focused" in prototype)) Object.defineProperty(prototype, "focused", focused);
	});

	// reload와 세션 교체는 shutdown → factory → session_start 순서로 진행된다.
	pi.on("session_shutdown", () => {
		if (Object.getOwnPropertyDescriptor(prototype, "focused")?.get === focused.get) delete prototype.focused;
	});
}
