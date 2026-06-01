import { truncateToWidth } from "@earendil-works/pi-tui";

export const SEP = " · ";
const ELLIPSIS = "...";

export function fit(text: string, width: number): string {
	return truncateToWidth(text, width, width <= ELLIPSIS.length ? "" : ELLIPSIS);
}

export function compactWhitespace(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

export function joinNonEmpty(parts: Array<string | null | undefined>, separator = SEP): string {
	return parts.filter((part): part is string => Boolean(part)).join(separator);
}
