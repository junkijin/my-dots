import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function currentDateSpacingExtension(pi: ExtensionAPI): void {
	pi.on("before_agent_start", async (event) => {
		const systemPrompt = event.systemPrompt.replace(/\n(?=Current date: )/, "\n\n\n");

		if (systemPrompt === event.systemPrompt) return undefined;
		return { systemPrompt };
	});
}
