import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const TITLE = "Pi needs your attention";
const PREVIEW_LENGTH = 30;

export default function (pi: ExtensionAPI) {
	pi.on("agent_settled", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		const messages = ctx.sessionManager
			.getBranch()
			.flatMap((entry) => (entry.type === "message" ? [entry.message] : []));
		const message = messages.findLast((message) => message.role === "assistant");
		if (!message || message.stopReason === "aborted") return;

		const text = message.content
			.filter((part) => part.type === "text")
			.map((part) => part.text)
			.join("");
		const chars = [...text.replace(/[\s\p{Cc}]+/gu, " ").trim()];
		const body = chars.slice(0, PREVIEW_LENGTH).join("") + (chars.length > PREVIEW_LENGTH ? "..." : "");

		let sequence = `\x1b]777;notify;${TITLE};${body}\x07`;
		// tmux does not forward OSC 777 by itself; wrap it for passthrough (needs allow-passthrough).
		if (process.env.TMUX) sequence = `\x1bPtmux;${sequence.replaceAll("\x1b", "\x1b\x1b")}\x1b\\`;
		process.stdout.write(sequence);
	});
}
