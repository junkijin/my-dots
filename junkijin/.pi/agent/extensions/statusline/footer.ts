import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getLatestCommitSubject } from "./commit.js";
import { renderStatusline } from "./render.js";

export function registerStatusline(pi: ExtensionAPI): void {
	pi.on("session_start", (_event, ctx) => {
		ctx.ui.setFooter((tui: any, theme: any, footerData: any) => {
			const unsubscribe = footerData.onBranchChange(() => tui.requestRender());

			return {
				dispose: unsubscribe,
				invalidate() {},
				render(width: number): string[] {
					return renderStatusline({
						pi,
						ctx,
						theme,
						width,
						latestCommitSubject: getLatestCommitSubject(ctx.cwd),
						extensionStatuses: footerData.getExtensionStatuses(),
					});
				},
			};
		});
	});
}
