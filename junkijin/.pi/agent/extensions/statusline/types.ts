import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { GitStatusSnapshot } from "./commit.js";

export interface ThemeLike {
	fg(color: string, text: string): string;
}

export type ExtensionStatusEntries = Iterable<[string, string]>;

export interface StatuslineRenderState {
	pi: Pick<ExtensionAPI, "getThinkingLevel">;
	ctx: ExtensionContext;
	theme: ThemeLike;
	width: number;
	gitStatus: GitStatusSnapshot;
	extensionStatuses: ExtensionStatusEntries;
}
