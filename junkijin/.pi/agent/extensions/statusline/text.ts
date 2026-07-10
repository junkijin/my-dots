import { sliceByColumn, visibleWidth } from "@earendil-works/pi-tui";

export const SEP = " · ";
const ELLIPSIS = "...";
const RESET = "\x1b[0m";

export function fit(text: string, width: number): string {
	if (width <= 0) return "";
	if (visibleWidth(text) <= width) return text;

	const ellipsis = width <= ELLIPSIS.length ? "" : ELLIPSIS;
	const prefix = sliceByColumn(text, 0, width - visibleWidth(ellipsis), true);
	const fitted = prefix + ellipsis;

	return prefix.includes("\x1b") ? fitted + RESET : fitted;
}

export function compactWhitespace(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

export function joinNonEmpty(parts: Array<string | null | undefined>, separator = SEP): string {
	return parts.filter((part): part is string => Boolean(part)).join(separator);
}
