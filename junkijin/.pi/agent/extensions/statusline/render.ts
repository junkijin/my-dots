import { renderLeftPriorityLine, renderRightPriorityLine } from "./layout.js";
import { renderMainLeftSegment, renderMainRightSegment } from "./segments.js";
import { renderExtensionStatuses } from "./statuses.js";
import type { StatuslineRenderState } from "./types.js";

export function renderStatusline(state: StatuslineRenderState): string[] {
	const mainLine = renderLeftPriorityLine(
		renderMainLeftSegment(state),
		renderMainRightSegment(state),
		state.width,
	);
	const lines = [mainLine ? state.theme.fg("dim", mainLine) : ""];

	const statusText = renderExtensionStatuses(state.extensionStatuses);
	const secondLine = renderRightPriorityLine(statusText, "", state.width);

	if (secondLine) {
		lines.push(state.theme.fg("dim", secondLine));
	}

	return lines;
}
