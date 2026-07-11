import { sliceByColumn, visibleWidth } from "@earendil-works/pi-tui";

export const SEP = " · ";
const ELLIPSIS = "...";
const RESET = "\x1b[0m";

const ESC = 0x1b;
const BEL = 0x07;
const C1_CSI = 0x9b;
const C1_ST = 0x9c;
const CONTROL_STRING_INTRODUCERS = new Set([0x50, 0x58, 0x5d, 0x5e, 0x5f]);
const C1_CONTROL_STRING_INTRODUCERS = new Set([0x90, 0x98, 0x9d, 0x9e, 0x9f]);

export function fit(text: string, width: number): string {
	if (width <= 0) return "";
	if (visibleWidth(text) <= width) return text;

	const ellipsis = width <= ELLIPSIS.length ? "" : ELLIPSIS;
	const prefix = sliceByColumn(text, 0, width - visibleWidth(ellipsis), true);
	const fitted = prefix + ellipsis;

	return prefix.includes("\x1b") ? fitted + RESET : fitted;
}

export function compactWhitespace(text: string): string {
	return sanitizeTerminalText(text).replace(/\s+/g, " ").trim();
}

export function joinNonEmpty(parts: Array<string | null | undefined>, separator = SEP): string {
	return parts.filter((part): part is string => Boolean(part)).join(separator);
}

/**
 * Remove terminal control data from repository- and extension-controlled text.
 * Theme ANSI is added only after this function has processed the plain data.
 */
export function sanitizeTerminalText(text: string): string {
	let result = "";

	for (let index = 0; index < text.length; ) {
		const code = text.charCodeAt(index);

		if (code === ESC) {
			const introducer = text.charCodeAt(index + 1);
			if (introducer === 0x5b) {
				index = skipCsi(text, index + 2);
			} else if (CONTROL_STRING_INTRODUCERS.has(introducer)) {
				index = skipControlString(text, index + 2);
			} else {
				index = skipEscapeSequence(text, index + 1);
			}
			continue;
		}

		if (code === C1_CSI) {
			index = skipCsi(text, index + 1);
			continue;
		}

		if (C1_CONTROL_STRING_INTRODUCERS.has(code)) {
			index = skipControlString(text, index + 1);
			continue;
		}

		if (code < 0x20 || code === 0x7f || (code >= 0x80 && code <= 0x9f)) {
			if (code === 0x09 || code === 0x0a || code === 0x0d) result += " ";
			index += 1;
			continue;
		}

		result += text[index];
		index += 1;
	}

	return result;
}

function skipCsi(text: string, start: number): number {
	let index = start;
	while (index < text.length) {
		const code = text.charCodeAt(index);
		index += 1;
		if (code >= 0x40 && code <= 0x7e) break;
	}
	return index;
}

function skipControlString(text: string, start: number): number {
	let index = start;
	while (index < text.length) {
		const code = text.charCodeAt(index);
		if (code === BEL || code === C1_ST) return index + 1;
		if (code === ESC && text.charCodeAt(index + 1) === 0x5c) return index + 2;
		index += 1;
	}
	return index;
}

function skipEscapeSequence(text: string, start: number): number {
	let index = start;
	while (index < text.length) {
		const code = text.charCodeAt(index);
		if (code >= 0x20 && code <= 0x2f) {
			index += 1;
			continue;
		}
		return code >= 0x30 && code <= 0x7e ? index + 1 : index;
	}
	return index;
}
