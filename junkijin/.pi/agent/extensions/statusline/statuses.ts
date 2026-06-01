import type { ExtensionStatusEntries } from "./types.js";
import { compactWhitespace, SEP } from "./text.js";

export function renderExtensionStatuses(statuses: ExtensionStatusEntries): string {
	return [...statuses]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, text]) => compactWhitespace(text))
		.filter((text) => text.length > 0)
		.join(SEP);
}
