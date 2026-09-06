import type { BuildSystemPromptOptions, ExtensionAPI } from "@earendil-works/pi-coding-agent";

type Skill = NonNullable<BuildSystemPromptOptions["skills"]>[number];
type ProjectContextFile = NonNullable<BuildSystemPromptOptions["contextFiles"]>[number];

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function formatSkill(skill: Skill): string {
	return `<skill path="${escapeXml(skill.filePath)}">
<name>${escapeXml(skill.name.trim())}</name>
<description>${skill.description.trim()}</description>
</skill>`;
}

function buildSkillsPrompt(skills: Skill[]): string | undefined {
	const skillElements = skills
		.filter((skill) => !skill.disableModelInvocation)
		.map(formatSkill)
		.join("\n");

	if (!skillElements) return undefined;
	return `## Skills

The following skills contain task-specific instructions. When a skill's activation criteria are met, read its SKILL.md before proceeding. Resolve relative paths referenced by SKILL.md from the directory containing that file.

<skills>
${skillElements}
</skills>`;
}

function formatProjectContext({ path, content }: ProjectContextFile): string {
	return `<project_context path="${escapeXml(path)}">
${content.trim()}
</project_context>`;
}

function buildProjectContextPrompt(contextFiles: ProjectContextFile[]): string | undefined {
	const projectInstructions = contextFiles
		.filter(({ content }) => content.trim())
		.map(formatProjectContext)
		.join("\n");

	if (!projectInstructions) return undefined;
	return `## Project Contexts

The following project contexts contain project-specific instructions relevant to the current work.

<project_contexts>
${projectInstructions}
</project_contexts>`;
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function buildRuntimeContextPrompt(cwd: string): string {
	return `## Session Context

Current date: ${formatDate(new Date())}
Current working directory: ${cwd.replace(/\\/g, "/")}`;
}

function joinPromptSections(sections: Array<string | undefined>): string {
	return sections
		.map((section) => section?.trim())
		.filter(Boolean)
		.join("\n\n");
}

export default function systemPromptOverridesExtension(pi: ExtensionAPI) {
	pi.on("before_agent_start", ({ systemPromptOptions }) => {
		const { customPrompt, selectedTools, cwd, contextFiles = [], skills = [] } = systemPromptOptions;
		const hasReadTool = !selectedTools || selectedTools.includes("read");

		return {
			systemPrompt: joinPromptSections([
				customPrompt,
				hasReadTool ? buildSkillsPrompt(skills) : undefined,
				buildProjectContextPrompt(contextFiles),
				buildRuntimeContextPrompt(cwd),
			]),
		};
	});
}
