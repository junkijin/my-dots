import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

export interface ThemeLike {
	fg(color: string, text: string): string;
}

export type ExtensionStatusEntries = Iterable<[string, string]>;

export interface StatuslineRenderState {
	pi: Pick<ExtensionAPI, "getThinkingLevel">;
	ctx: ExtensionContext;
	theme: ThemeLike;
	width: number;
	branch: string | null;
	extensionStatuses: ExtensionStatusEntries;
}
