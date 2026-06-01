import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerStatusline } from "./footer.js";

export default function statuslineExtension(pi: ExtensionAPI): void {
	registerStatusline(pi);
}
