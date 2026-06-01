import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { AssistantMessageComponent } from "@earendil-works/pi-coding-agent";
import { Markdown, Spacer, Text } from "@earendil-works/pi-tui";

type ThemeLike = {
	fg(color: string, text: string): string;
	italic(text: string): string;
};

type PatchState = {
	theme?: ThemeLike;
};

const STATE_KEY = Symbol.for("pi-extension:plain-thinking-renderer:state");
const PATCH_KEY = Symbol.for("pi-extension:plain-thinking-renderer:patched");

const state = ((globalThis as unknown as Record<symbol, PatchState>)[STATE_KEY] ??= {});

function styleThinking(text: string): string {
	if (state.theme) {
		return state.theme.italic(state.theme.fg("thinkingText", text));
	}

	// Fallback for any very early render before session_start provides ctx.ui.theme.
	return `\x1b[3m\x1b[38;5;244m${text}\x1b[39m\x1b[23m`;
}

function installPlainThinkingRendererPatch(): void {
	const proto = AssistantMessageComponent.prototype as unknown as Record<symbol | string, unknown>;
	if (proto[PATCH_KEY]) return;

	proto.updateContent = function updateContentPlainThinking(message: any): void {
		const self = this as any;
		self.lastMessage = message;

		self.contentContainer.clear();

		const hasVisibleContent = message.content.some(
			(c: any) => (c.type === "text" && c.text.trim()) || (c.type === "thinking" && c.thinking.trim()),
		);

		if (hasVisibleContent) {
			self.contentContainer.addChild(new Spacer(1));
		}

		for (let i = 0; i < message.content.length; i++) {
			const content = message.content[i];

			if (content.type === "text" && content.text.trim()) {
				self.contentContainer.addChild(new Markdown(content.text.trim(), 1, 0, self.markdownTheme));
				continue;
			}

			if (content.type !== "thinking" || !content.thinking.trim()) {
				continue;
			}

			const hasVisibleContentAfter = message.content
				.slice(i + 1)
				.some((c: any) => (c.type === "text" && c.text.trim()) || (c.type === "thinking" && c.thinking.trim()));

			if (self.hideThinkingBlock) {
				self.contentContainer.addChild(new Text(styleThinking(self.hiddenThinkingLabel), 1, 0));
			} else {
				// Thinking is auxiliary information. Render it as plain text, not Markdown,
				// so fenced code, headings, links, and syntax highlighting do not visually
				// compete with the assistant's final answer.
				self.contentContainer.addChild(new Text(styleThinking(content.thinking.trim()), 1, 0));
			}

			if (hasVisibleContentAfter) {
				self.contentContainer.addChild(new Spacer(1));
			}
		}

		const hasToolCalls = message.content.some((c: any) => c.type === "toolCall");
		self.hasToolCalls = hasToolCalls;

		if (hasToolCalls) return;

		if (message.stopReason === "aborted") {
			const abortMessage =
				message.errorMessage && message.errorMessage !== "Request was aborted"
					? message.errorMessage
					: "Operation aborted";
			self.contentContainer.addChild(new Spacer(1));
			self.contentContainer.addChild(new Text(state.theme ? state.theme.fg("error", abortMessage) : abortMessage, 1, 0));
		} else if (message.stopReason === "error") {
			const errorMsg = message.errorMessage || "Unknown error";
			self.contentContainer.addChild(new Spacer(1));
			self.contentContainer.addChild(
				new Text(state.theme ? state.theme.fg("error", `Error: ${errorMsg}`) : `Error: ${errorMsg}`, 1, 0),
			);
		}
	};

	proto[PATCH_KEY] = true;
}

export default function (pi: ExtensionAPI) {
	installPlainThinkingRendererPatch();

	pi.on("session_start", (_event, ctx) => {
		state.theme = ctx.ui.theme;
	});
}
