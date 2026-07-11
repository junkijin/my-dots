import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Component, TUI } from "@earendil-works/pi-tui";
import { GitStatusCache } from "./commit.js";
import { renderStatusline } from "./render.js";
import type { ExtensionStatusEntries, ThemeLike } from "./types.js";

interface FooterDataLike {
	getExtensionStatuses(): ExtensionStatusEntries;
	onBranchChange(callback: () => void): () => void;
}

interface ActiveFooter extends Component {
	dispose(): void;
	refreshGit(): void;
	requestRender(): void;
}

export function registerStatusline(pi: ExtensionAPI): void {
	let activeFooter: ActiveFooter | undefined;

	pi.on("session_start", (_event, ctx) => {
		ctx.ui.setFooter((tui, theme, footerData) => {
			activeFooter?.dispose();
			const footer = createFooter(pi, ctx, tui, theme, footerData, () => {
				if (activeFooter === footer) activeFooter = undefined;
			});
			activeFooter = footer;
			return footer;
		});
	});

	// Git-changing agent tools are the primary dirty-state signal. The settled
	// event also catches changes made by tools that finish near an aborted turn.
	pi.on("tool_execution_end", () => activeFooter?.refreshGit());
	pi.on("agent_settled", () => activeFooter?.refreshGit());

	// These events change official footer data without necessarily touching Git.
	pi.on("message_end", () => activeFooter?.requestRender());
	pi.on("model_select", () => activeFooter?.requestRender());
	pi.on("thinking_level_select", () => activeFooter?.requestRender());
	pi.on("session_compact", () => activeFooter?.requestRender());
	pi.on("session_tree", () => activeFooter?.requestRender());

	pi.on("session_shutdown", () => {
		activeFooter?.dispose();
		activeFooter = undefined;
	});
}

function createFooter(
	pi: ExtensionAPI,
	ctx: ExtensionContext,
	tui: TUI,
	theme: ThemeLike,
	footerData: FooterDataLike,
	onDispose: () => void,
): ActiveFooter {
	let disposed = false;
	const gitStatus = new GitStatusCache(pi, ctx.cwd, () => {
		if (!disposed) tui.requestRender();
	});
	const unsubscribeBranchChange = footerData.onBranchChange(() => gitStatus.refresh());

	const footer: ActiveFooter = {
		dispose() {
			if (disposed) return;
			disposed = true;
			unsubscribeBranchChange();
			gitStatus.dispose();
			onDispose();
		},
		invalidate() {
			if (!disposed) tui.requestRender();
		},
		refreshGit() {
			if (!disposed) gitStatus.refresh();
		},
		requestRender() {
			if (!disposed) tui.requestRender();
		},
		render(width: number): string[] {
			if (disposed) return [];
			return renderStatusline({
				pi,
				ctx,
				theme,
				width,
				gitStatus: gitStatus.getSnapshot(),
				extensionStatuses: footerData.getExtensionStatuses(),
			});
		},
	};

	gitStatus.refresh();
	return footer;
}
