import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { homedir } from "node:os";
import { sep } from "node:path";

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

function align(left: string, right: string, width: number): string {
	const rightText = truncateToWidth(right, width, "");
	const rightWidth = visibleWidth(rightText);
	const leftText = truncateToWidth(left, width - rightWidth - 1);
	return leftText + " ".repeat(Math.max(0, width - visibleWidth(leftText) - rightWidth)) + rightText;
}

export default function (pi: ExtensionAPI) {
	let requestRender = () => {};

	pi.on("session_start", (_event, ctx) => {
		ctx.ui.setFooter((tui, theme, footerData) => {
			requestRender = () => tui.requestRender();
			return {
				invalidate() {},
				render(width) {
					const home = homedir();
					const cwd = ctx.cwd === home ? "~" : ctx.cwd.startsWith(home + sep) ? `~${ctx.cwd.slice(home.length)}` : ctx.cwd;
					const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "model not selected";
					const contextTokens = ctx.getContextUsage()?.tokens;
					const context = contextTokens == null ? "" : `${(contextTokens / 1000).toFixed(1)}K • `;
					const main = align(clean(cwd), `${context}${clean(model)} (${clean(pi.getThinkingLevel())})`, width);
					const statuses = [...footerData.getExtensionStatuses()]
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([, text]) => clean(text))
						.filter(Boolean)
						.join(" · ");

					return [main, ...(statuses ? [truncateToWidth(statuses, width)] : [])].map((line) => theme.fg("dim", line));
				},
			};
		});
	});

	pi.on("model_select", () => requestRender());
	pi.on("thinking_level_select", () => requestRender());
}
