import { spawnSync } from "node:child_process";
import * as os from "node:os";
import { type ExtensionAPI, getShellConfig } from "@earendil-works/pi-coding-agent";

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function element(tag: string, content: string, path?: string): string {
	const attribute = path === undefined ? "" : ` path="${escapeXml(path)}"`;
	return `<${tag}${attribute}>
${content}
</${tag}>`;
}

function listSection(tag: string, intro: string, items: string[]): string | undefined {
	if (items.length === 0) return undefined;
	return element(
		tag,
		`${intro}

${items.join("\n")}`,
	);
}

function describeShell(): string {
	const { shell } = getShellConfig();
	const version = spawnSync(shell, ["--version"], { encoding: "utf8" }).stdout?.split("\n")[0];
	return version ? `${shell} (${version})` : shell;
}

export default function systemPromptExtension(pi: ExtensionAPI) {
	const operatingSystem = `${os.type()} ${os.release()} (${os.arch()})`;
	const shell = describeShell();

	pi.on("before_agent_start", ({ systemPromptOptions }) => {
		const { customPrompt, selectedTools, skills, contextFiles, cwd } = systemPromptOptions;

		const skillElements = selectedTools.includes("read")
			? skills
					.filter((skill) => !skill.disableModelInvocation)
					.map((skill) =>
						element(
							"skill",
							`<name>${escapeXml(skill.name.trim())}</name>
<description>${skill.description.trim()}</description>`,
							skill.filePath,
						),
					)
			: [];
		const contextElements = contextFiles
			.filter(({ content }) => content.trim())
			.map(({ path, content }) => element("project_context", content.trim(), path));

		const blocks = [
			customPrompt?.trim(),
			listSection(
				"skills",
				"The following skills contain task-specific instructions. When a skill's activation criteria are met, read its SKILL.md before proceeding. Resolve relative paths referenced by SKILL.md from the directory containing that file.",
				skillElements,
			),
			listSection(
				"project_contexts",
				"The following project contexts contain project-specific instructions relevant to the current work.",
				contextElements,
			),
			element(
				"session_context",
				`Operating system: ${operatingSystem}
Shell: ${shell}
Current working directory: ${cwd.replace(/\\/g, "/")}`,
			),
		];
		return { systemPrompt: blocks.filter(Boolean).join("\n\n") };
	});
}
