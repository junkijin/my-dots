import { execFile } from "node:child_process";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ESC = "\x1b";
const ST = `${ESC}\\`;
const TITLE = "Pi need your attention";

function write(sequence: string): void {
	if (process.env.TMUX) {
		sequence = `${ESC}Ptmux;${sequence.replaceAll(ESC, ESC + ESC)}${ST}`;
	}
	process.stdout.write(sequence);
}

function notifyWindows(body: string): void {
	const safeBody = body.replaceAll("'", "''");
	const script = `
$manager = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
$xml = $manager::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText01)
$xml.GetElementsByTagName('text')[0].AppendChild($xml.CreateTextNode('${safeBody}')) > $null
$manager::CreateToastNotifier('${TITLE}').Show([Windows.UI.Notifications.ToastNotification]::new($xml))
`;

	execFile("powershell.exe", ["-NoProfile", "-Command", script]);
}

function notify(body: string): void {
	if (process.env.WT_SESSION) {
		notifyWindows(body);
		return;
	}

	if (!process.stdout.isTTY) return;

	const safeBody = body.replace(/[\x1b\x07\u009c]/g, "").replace(/[\r\n]/g, " ");

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

		const text = message.content
			.filter((part) => part.type === "text")
			.map((part) => part.text)
			.join("");
		const chars = [...text];
		description = chars.slice(0, 30).join("") + (chars.length > 30 ? "..." : "");
	});

	pi.on("agent_settled", () => {
		if (description !== undefined) notify(description);
		description = undefined;
	});
}
