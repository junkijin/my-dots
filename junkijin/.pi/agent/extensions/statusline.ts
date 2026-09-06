import { CONFIG_DIR_NAME, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";

const clean = (text: string) => text.replace(/\s+/g, " ").trim();
const piHome = resolve(homedir(), CONFIG_DIR_NAME);

const contextFormatter = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
});

function lookupBase(path: string): string | undefined {
	try {
		return statSync(path).isDirectory() ? path : dirname(path);
	} catch {
		return undefined;
	}
}

function findGitRepoRoot(cwd: string): string | undefined {
	let directory = lookupBase(cwd);
	while (directory) {
		if (existsSync(join(directory, ".git"))) return directory;
		const parent = dirname(directory);
		if (parent === directory) return undefined;
		directory = parent;
	}
	return undefined;
}

function findProjectConfigRoot(cwd: string): string | undefined {
	let directory = lookupBase(cwd);
	let root: string | undefined;
	while (directory) {
		const dotPi = join(directory, CONFIG_DIR_NAME);
		try {
			if (resolve(dotPi) !== piHome && statSync(dotPi).isDirectory()) root = directory;
		} catch {
			// Missing or unreadable project config directories are not config layers.
		}
		const parent = dirname(directory);
		if (parent === directory) break;
		directory = parent;
	}
	return root;
}

function getProjectName(cwd: string): string {
	const root = findGitRepoRoot(cwd) ?? findProjectConfigRoot(cwd);
	if (root) return basename(root) || root;

	const home = homedir();
	return cwd === home ? "~" : cwd.startsWith(home + sep) ? `~${cwd.slice(home.length)}` : cwd;
}

function align(left: string, right: string, width: number, style: (text: string) => string): string {
	const rightText = truncateToWidth(style(right), width, "");
	const rightWidth = visibleWidth(rightText);
	const leftText = truncateToWidth(style(left), width - rightWidth - 1, style("..."));
	return leftText + " ".repeat(Math.max(0, width - visibleWidth(leftText) - rightWidth)) + rightText;
}

export default function (pi: ExtensionAPI) {
	let requestRender = () => {};

	pi.on("session_start", (_event, ctx) => {
		const projectName = getProjectName(ctx.cwd);
		ctx.ui.setFooter((tui, theme, footerData) => {
			requestRender = () => tui.requestRender();
			return {
				invalidate() {},
				render(width) {
					const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "model not selected";
					const usage = ctx.getContextUsage();
					const context = usage?.percent == null
						? ""
						: `${usage.percent.toFixed(1)}% (${contextFormatter.format(usage.contextWindow)}) • `;
					const dim = (text: string) => theme.fg("dim", text);
					const main = align(clean(projectName), `${context}${clean(model)} (${clean(pi.getThinkingLevel())})`, width, dim);
					const statuses = [...footerData.getExtensionStatuses()]
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([, text]) => clean(text))
						.filter(Boolean)
						.join(" · ");

					return [main, ...(statuses ? [truncateToWidth(dim(statuses), width, dim("..."))] : [])];
				},
			};
		});
	});

	pi.on("model_select", () => requestRender());
	pi.on("thinking_level_select", () => requestRender());
}
