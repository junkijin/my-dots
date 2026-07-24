import type { BuildSystemPromptOptions } from "@earendil-works/pi-coding-agent";
import {
	AVAILABLE_SKILLS_PROMPT_TEMPLATE,
	PROJECT_CONTEXT_PROMPT_TEMPLATE,
	RUNTIME_CONTEXT_PROMPT_TEMPLATE,
	renderPromptTemplate,
} from "./prompt-files.ts";

type SkillForPrompt = NonNullable<BuildSystemPromptOptions["skills"]>[number];
type ProjectContextFile = NonNullable<BuildSystemPromptOptions["contextFiles"]>[number];
type PromptSection = string | undefined | null | false;

const PROMPT_SECTION_SEPARATOR = "\n\n";
const PROMPT_SEPERATOR = "\n";

function joinPromptSections(sections: PromptSection[]): string {
	return sections
		.map((section) => (section ? section.trim() : ""))
		.filter((section) => section.length > 0)
		.join(PROMPT_SECTION_SEPARATOR);
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function formatXmlElement(name: string, content: string): string {
	return `<${name}>${escapeXml(content.trim())}</${name}>`;
}

function formatSkillsForPrompt(skills: SkillForPrompt[]): string {
	const visibleSkills = skills.filter((skill) => !skill.disableModelInvocation);
	if (visibleSkills.length === 0) return "";

	const skillElements = visibleSkills.map((skill) =>
		[
			`<skill path="${escapeXml(skill.filePath)}">`,
			formatXmlElement("name", skill.name),
			"<description>",
			skill.description,
			"</description>",
			"</skill>",
		].join(PROMPT_SEPERATOR),
	);

	return renderPromptTemplate(AVAILABLE_SKILLS_PROMPT_TEMPLATE, {
		SKILL_ELEMENTS: skillElements.join(PROMPT_SEPERATOR),
	});
}

function formatProjectContext(contextFiles: ProjectContextFile[]): string {
	const filteredContexts = contextFiles.filter(context => !!context.content.trim());
	if (filteredContexts.length === 0) return "";

	const contextElements = filteredContexts.map((context) =>
		[
			`<project_context path="${escapeXml(context.path)}">`,
			context.content.trim(),
			"</project_context>",
		].join(PROMPT_SEPERATOR),
	);

	return renderPromptTemplate(PROJECT_CONTEXT_PROMPT_TEMPLATE, {
		PROJECT_INSTRUCTIONS: contextElements.join(PROMPT_SEPERATOR),
	});
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function formatRuntimeContext(cwd: string): string {
	return renderPromptTemplate(RUNTIME_CONTEXT_PROMPT_TEMPLATE, {
		DATE: formatDate(new Date()),
		CWD: cwd.replace(/\\/g, "/"),
	});
}

export function buildSystemPrompt(options: BuildSystemPromptOptions): string {
	const { customPrompt, selectedTools, cwd, contextFiles = [], skills = [] } = options;
	const hasReadTool = !selectedTools || selectedTools.includes("read");

	return joinPromptSections([
		customPrompt,
		hasReadTool ? formatSkillsForPrompt(skills) : undefined,
		formatProjectContext(contextFiles),
		formatRuntimeContext(cwd),
	]);
}
