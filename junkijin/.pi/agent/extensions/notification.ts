import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ESC = "\x1b";
const ST = `${ESC}\\`;
const TITLE = "Pi need your attention";

function write(sequence: string): void {
	if (!process.stdout.isTTY) return;
	process.stdout.write(process.env.TMUX ? `${ESC}Ptmux;${sequence.replaceAll(ESC, ESC + ESC)}${ST}` : sequence);
}

function notifyWindows(body: string): void {
	const type = "Windows.UI.Notifications";
	const mgr = `[${type}.ToastNotificationManager, ${type}, ContentType = WindowsRuntime]`;
	const template = `[${type}.ToastTemplateType]::ToastText01`;
	const toast = `[${type}.ToastNotification]::new($xml)`;
	const safeBody = body.replaceAll("'", "''");
	const script = [
		`${mgr} > $null`,
		`$xml = [${type}.ToastNotificationManager]::GetTemplateContent(${template})`,
		`$xml.GetElementsByTagName('text')[0].AppendChild($xml.CreateTextNode('${safeBody}')) > $null`,
		`[${type}.ToastNotificationManager]::CreateToastNotifier('${TITLE}').Show(${toast})`,
	].join("; ");

	require("child_process").execFile("powershell.exe", ["-NoProfile", "-Command", script]);
}

function notify(body: string): void {
	if (process.env.WT_SESSION) {
		notifyWindows(body);
		return;
	}

	const safeBody = body
		.replaceAll(ESC, "")
		.replaceAll("\x07", "")
		.replaceAll("\u009c", "")
		.replaceAll("\r", " ")
		.replaceAll("\n", " ");

	if (process.env.KITTY_WINDOW_ID) {
		write(`${ESC}]99;i=1:d=0;${TITLE}${ST}`);
		write(`${ESC}]99;i=1:p=body;${safeBody}${ST}`);
		return;
	}

	write(`${ESC}]777;notify;${TITLE};${safeBody}\x07`);
}

export default function (pi: ExtensionAPI) {
	let description: string | undefined;

	pi.on("agent_end", ({ messages }) => {
		description = undefined;
		const message = messages.findLast((message) => message.role === "assistant");
		if (!message || message.stopReason === "aborted") return;

		const chars = [...message.content.map((part) => (part.type === "text" ? part.text : "")).join("")];
		description = chars.slice(0, 30).join("") + (chars.length > 30 ? "..." : "");
	});

	pi.on("agent_settled", () => {
		if (description !== undefined) notify(description);
		description = undefined;
	});
}
