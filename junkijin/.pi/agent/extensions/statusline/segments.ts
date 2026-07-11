import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { basename } from "node:path";
import type { StatuslineRenderState } from "./types.js";
import { compactWhitespace, joinNonEmpty } from "./text.js";

const MAX_COMMIT_SUBJECT_CHARACTERS = 30;
const ELLIPSIS = "…";

export function renderDirectorySegment(
	ctx: ExtensionContext,
	gitStatus: StatuslineRenderState["gitStatus"],
): string {
	const dirName = compactWhitespace(basename(ctx.cwd) || ctx.cwd);
	const branch = gitStatus.branch ? compactWhitespace(gitStatus.branch) : null;
	const repository = branch
		? `${branch} ${gitStatus.dirtyFileCount > 0 ? `dirty:${gitStatus.dirtyFileCount}` : "clean"}`
		: gitStatus.dirtyFileCount > 0
			? `dirty:${gitStatus.dirtyFileCount}`
			: null;
	const subject = gitStatus.latestCommitSubject
		? truncateToCharacters(compactWhitespace(gitStatus.latestCommitSubject), MAX_COMMIT_SUBJECT_CHARACTERS)
		: null;

	return joinNonEmpty([dirName, repository, subject ? `(${subject})` : null]);
}

export function renderModelSegment(ctx: ExtensionContext): string {
	return ctx.model
		? `${compactWhitespace(ctx.model.provider)}/${compactWhitespace(ctx.model.id)}`
		: "model not selected";
}

export function renderModelThinkingSegment(state: Pick<StatuslineRenderState, "pi" | "ctx">): string {
	return `${renderModelSegment(state.ctx)} (${compactWhitespace(state.pi.getThinkingLevel())})`;
}

export function renderContextUsageSegment(ctx: ExtensionContext): string {
	const usage = ctx.getContextUsage();
	if (!usage) return "";
	if (usage.percent === null || !Number.isFinite(usage.percent)) return "ctx ?%";

	const percent = Math.max(0, Math.min(100, Math.round(usage.percent)));
	return `ctx ${percent}%`;
}

export function renderMainLeftSegment(state: Pick<StatuslineRenderState, "ctx" | "gitStatus">): string {
	return renderDirectorySegment(state.ctx, state.gitStatus);
}

export function renderMainRightSegment(state: Pick<StatuslineRenderState, "pi" | "ctx">): string {
	return joinNonEmpty([renderContextUsageSegment(state.ctx), renderModelThinkingSegment(state)]);
}

function truncateToCharacters(text: string, maxCharacters: number): string {
	const characters = Array.from(text);
	if (characters.length <= maxCharacters) return text;
	if (maxCharacters <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxCharacters);

	return characters.slice(0, maxCharacters - ELLIPSIS.length).join("") + ELLIPSIS;
}
