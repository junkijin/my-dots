import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { homedir } from "node:os";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { StatuslineRenderState } from "./types.js";
import { compactWhitespace } from "./text.js";

function formatCwd(cwd: string): string {
	const resolvedCwd = resolve(cwd);
	const resolvedHome = resolve(homedir());
	const relativeToHome = relative(resolvedHome, resolvedCwd);
	const isInsideHome =
		relativeToHome === "" ||
		(relativeToHome !== ".." && !relativeToHome.startsWith(`..${sep}`) && !isAbsolute(relativeToHome));

	if (!isInsideHome) return cwd;
	return relativeToHome === "" ? "~" : `~${sep}${relativeToHome}`;
}

export function renderMainLeftSegment(state: Pick<StatuslineRenderState, "ctx">): string {
	return compactWhitespace(formatCwd(state.ctx.cwd));
}

export function renderMainRightSegment(state: Pick<StatuslineRenderState, "pi" | "ctx">): string {
	const model = state.ctx.model
		? `${compactWhitespace(state.ctx.model.provider)}/${compactWhitespace(state.ctx.model.id)}`
		: "model not selected";
	const thinkingLevel = compactWhitespace(state.pi.getThinkingLevel());

	return `${model} (${thinkingLevel})`;
}
