import { CONFIG_DIR_NAME, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, sep } from "node:path";

const clean = (text: string) => text.replace(/\s+/g, " ").trim();
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function ancestors(dir: string): string[] {
	const parent = dirname(dir);
	return parent === dir ? [dir] : [dir, ...ancestors(parent)];
}

// Nearest Git root, else the outermost directory with a project config dir (not ~/.pi), else cwd shown relative to ~.
function projectName(cwd: string): string {
	const home = homedir();
	const dirs = ancestors(cwd);
	const root =
		dirs.find((dir) => existsSync(join(dir, ".git"))) ??
		dirs.findLast((dir) => dir !== home && existsSync(join(dir, CONFIG_DIR_NAME)));
	if (root) return basename(root) || root;
	return (cwd + sep).startsWith(home + sep) ? `~${cwd.slice(home.length)}` : cwd;
}

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		ctx.ui.setFooter((tui, theme, footerData) => {
			const dim = (text: string) => theme.fg("dim", text);
			const project = clean(projectName(ctx.cwd));
			return {
				// Thinking-level changes already re-render; models changed via pi.setModel() may not.
				dispose: pi.on("model_select", () => tui.requestRender()),
				invalidate() {},
				render(width) {
					const usage = ctx.getContextUsage();
					const context = usage?.percent == null
						? ""
						: `${usage.percent.toFixed(1)}% (${compact.format(usage.contextWindow)}) • `;
					const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "model not selected";
					const right = truncateToWidth(dim(`${context}${model} (${pi.getThinkingLevel()})`), width, "");
					const left = truncateToWidth(dim(project), width - visibleWidth(right) - 1, dim("..."));
					const main = left + " ".repeat(Math.max(0, width - visibleWidth(left) - visibleWidth(right))) + right;
					const statuses = [...footerData.getExtensionStatuses()]
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([, text]) => clean(text))
						.filter(Boolean)
						.join(" · ");
					return statuses ? [main, truncateToWidth(dim(statuses), width, dim("..."))] : [main];
				},
			};
		});
	});
}
