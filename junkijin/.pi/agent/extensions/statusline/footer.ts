import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Component, TUI } from "@earendil-works/pi-tui";
import { renderStatusline } from "./render.js";
import type { ExtensionStatusEntries, ThemeLike } from "./types.js";

interface FooterDataLike {
	getExtensionStatuses(): ExtensionStatusEntries;
}

interface ActiveFooter extends Component {
	dispose(): void;
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

	pi.on("model_select", () => activeFooter?.requestRender());
	pi.on("thinking_level_select", () => activeFooter?.requestRender());

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

	const footer: ActiveFooter = {
		dispose() {
			if (disposed) return;
			disposed = true;
			onDispose();
		},
		invalidate() {
			if (!disposed) tui.requestRender();
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
				extensionStatuses: footerData.getExtensionStatuses(),
			});
		},
	};

	return footer;
}
