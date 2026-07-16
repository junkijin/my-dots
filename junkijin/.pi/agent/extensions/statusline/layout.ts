import { visibleWidth } from "@earendil-works/pi-tui";
import { fit } from "./text.js";

export function renderRightPriorityLine(left: string, right: string, width: number): string {
	if (width <= 0) return "";

	const rightText = fit(right, width);
	if (!rightText) return fit(left, width);

	const rightWidth = visibleWidth(rightText);
	const leftBudget = width - rightWidth - 1;
	if (leftBudget <= 3) {
		return " ".repeat(Math.max(0, width - rightWidth)) + rightText;
	}

	const leftText = fit(left, leftBudget);
	const leftWidth = visibleWidth(leftText);
	const gap = " ".repeat(Math.max(1, width - leftWidth - rightWidth));
	return leftText + gap + rightText;
}
