import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { buildSystemPrompt } from "./system-prompt.ts";

export default function systemPromptOverridesExtension(pi: ExtensionAPI) {
	pi.on("before_agent_start", (event) => ({
		systemPrompt: buildSystemPrompt(event.systemPromptOptions),
	}));
}
