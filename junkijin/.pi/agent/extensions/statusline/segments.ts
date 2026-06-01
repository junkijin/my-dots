import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { basename } from "node:path";
import type { StatuslineRenderState } from "./types.js";
import { joinNonEmpty } from "./text.js";

export function renderDirectorySegment(ctx: ExtensionContext, latestCommitSubject: string | null): string {
	const dirName = basename(ctx.cwd) || ctx.cwd;
	return latestCommitSubject ? `${dirName} (${latestCommitSubject})` : dirName;
}

export function renderContextUsageSegment(ctx: ExtensionContext): string | null {
	const usage = ctx.getContextUsage();
	if (!usage || usage.percent === null) return null;

	return `${Math.round(usage.percent)}% context used`;
}

export function renderModelSegment(ctx: ExtensionContext): string {
	return ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "model not selected";
}

export function renderModelThinkingSegment(state: Pick<StatuslineRenderState, "pi" | "ctx">): string {
	return `${renderModelSegment(state.ctx)} (${state.pi.getThinkingLevel()})`;
}

export function renderMainLeftSegment(state: Pick<StatuslineRenderState, "ctx" | "latestCommitSubject">): string {
	return renderDirectorySegment(state.ctx, state.latestCommitSubject);
}

export function renderMainRightSegment(state: Pick<StatuslineRenderState, "pi" | "ctx">): string {
	return joinNonEmpty([renderContextUsageSegment(state.ctx), renderModelThinkingSegment(state)]);
}
