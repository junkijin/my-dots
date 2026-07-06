import { type BuildSystemPromptOptions } from "@earendil-works/pi-coding-agent";
import { existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

type SkillForPrompt = NonNullable<BuildSystemPromptOptions["skills"]>[number];

type PromptSection = string | undefined | null | false;

const PROMPT_SECTION_SEPARATOR = "\n\n";
const PROJECT_CONTEXT_SEPARATOR = "\n";

function normalizePromptSection(section: PromptSection): string | undefined {
	if (!section) return undefined;

	const trimmed = section.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function joinPromptSections(sections: PromptSection[]): string {
	const normalizedSections: string[] = [];

	for (const section of sections) {
		const normalizedSection = normalizePromptSection(section);
		if (normalizedSection) normalizedSections.push(normalizedSection);
	}

	return normalizedSections.join(PROMPT_SECTION_SEPARATOR);
}

export function appendPrompt(existing: string | undefined, additionalPrompt: string): string {
	return joinPromptSections([existing, additionalPrompt]);
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
	const trimmedContent = content.trim();

	if (trimmedContent.length === 0) {
		return `<${name}></${name}>`;
	}

	return `<${name}>${escapeXml(trimmedContent)}</${name}>`;
}

function formatSkillsForPrompt(skills: SkillForPrompt[]): string {
	const visibleSkills = skills.filter((skill) => !skill.disableModelInvocation);
	if (visibleSkills.length === 0) return "";

	const lines = [
		"<available_skills>",
		"<instructions>",
		formatXmlElement("instruction", "The following skills provide specialized instructions for specific tasks."),
		formatXmlElement("instruction", "Use the read tool to load a skill's file when the task matches its description."),
		formatXmlElement(
			"instruction",
			"When a skill file references a relative path, resolve it against the skill directory (parent of SKILL.md / dirname of the path) and use that absolute path in tool commands.",
		),
		"</instructions>",
	];

	for (const skill of visibleSkills) {
		lines.push("<skill>");
		lines.push(formatXmlElement("name", skill.name));
		lines.push(formatXmlElement("description", skill.description));
		lines.push(formatXmlElement("location", skill.filePath));
		lines.push("</skill>");
	}

	lines.push("</available_skills>");
	return lines.join("\n");
}

function getPiPackageDir(): string {
	const envDir = process.env.PI_PACKAGE_DIR;
	if (envDir) return envDir;

	const entrypoint = process.argv[1];
	const candidates: string[] = [];
	if (entrypoint) {
		candidates.push(entrypoint);
		try {
			candidates.push(realpathSync.native(entrypoint));
		} catch {
			// Ignore unresolved argv path and try the original path only.
		}
	}

	for (const candidate of candidates) {
		let dir = dirname(candidate);
		while (dir !== dirname(dir)) {
			if (existsSync(join(dir, "package.json"))) return dir;
			dir = dirname(dir);
		}
	}

	return dirname(process.argv[1] ?? process.cwd());
}

type ProjectContextFile = NonNullable<BuildSystemPromptOptions["contextFiles"]>[number];

function formatProjectInstruction({ path: filePath, content }: ProjectContextFile): string {
	const trimmedContent = content.trim();
	const escapedPath = escapeXml(filePath);

	if (trimmedContent.length === 0) {
		return `<project_instructions path="${escapedPath}"></project_instructions>`;
	}

	return [`<project_instructions path="${escapedPath}">`, trimmedContent, "</project_instructions>"].join(PROJECT_CONTEXT_SEPARATOR);
}

function formatProjectContext(contextFiles: NonNullable<BuildSystemPromptOptions["contextFiles"]>): string {
	if (contextFiles.length === 0) return "";

	const projectContextLines = [
		"<project_context>",
		formatXmlElement("summary", "Project-specific instructions and guidelines"),
		...contextFiles.map(formatProjectInstruction),
		"</project_context>",
	];

	return projectContextLines.map((line) => line.trimEnd()).filter((line) => line.trim().length > 0).join(PROJECT_CONTEXT_SEPARATOR);
}

function formatRuntimeContext(date: string, cwd: string): string {
	return `Current date: ${date}\nCurrent working directory: ${cwd}`;
}

export function buildSystemPrompt(options: BuildSystemPromptOptions): string {
	const {
		customPrompt,
		selectedTools,
		toolSnippets,
		promptGuidelines,
		appendSystemPrompt,
		cwd,
		contextFiles: providedContextFiles,
		skills: providedSkills,
	} = options;
	const promptCwd = cwd.replace(/\\/g, "/");
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const date = `${year}-${month}-${day}`;
	const contextFiles = providedContextFiles ?? [];
	const skills = providedSkills ?? [];

	if (customPrompt) {
		const customPromptHasRead = !selectedTools || selectedTools.includes("read");

		return joinPromptSections([
			customPrompt,
			appendSystemPrompt,
			formatProjectContext(contextFiles),
			customPromptHasRead ? formatSkillsForPrompt(skills) : undefined,
			formatRuntimeContext(date, promptCwd),
		]);
	}

	const packageDir = getPiPackageDir();
	const readmePath = resolve(join(packageDir, "README.md"));
	const docsPath = resolve(join(packageDir, "docs"));
	const examplesPath = resolve(join(packageDir, "examples"));
	const tools = selectedTools || ["read", "bash", "edit", "write"];
	const visibleTools = tools.filter((name) => !!toolSnippets?.[name]);
	const toolsList =
		visibleTools.length > 0 ? visibleTools.map((name) => `- ${name}: ${toolSnippets[name]}`).join("\n") : "(none)";

	const guidelinesList: string[] = [];
	const guidelinesSet = new Set<string>();
	const addGuideline = (guideline: string) => {
		if (guidelinesSet.has(guideline)) return;
		guidelinesSet.add(guideline);
		guidelinesList.push(guideline);
	};

	const hasBash = tools.includes("bash");
	const hasGrep = tools.includes("grep");
	const hasFind = tools.includes("find");
	const hasLs = tools.includes("ls");
	const hasRead = tools.includes("read");

	if (hasBash && !hasGrep && !hasFind && !hasLs) {
		addGuideline("Use bash for file operations like ls, rg, find");
	}
	for (const guideline of promptGuidelines ?? []) {
		const normalized = guideline.trim();
		if (normalized.length > 0) addGuideline(normalized);
	}
	addGuideline("Be concise in your responses");
	addGuideline("Show file paths clearly when working with files");
	const guidelines = guidelinesList.map((guideline) => `- ${guideline}`).join("\n");

	const basePrompt = `You are an expert coding assistant operating inside pi, a coding agent harness. You help users by reading files, executing commands, editing code, and writing new files.

Available tools:
${toolsList}

In addition to the tools above, you may have access to other custom tools depending on the project.

Guidelines:
${guidelines}

Pi documentation (read only when the user asks about pi itself, its SDK, extensions, themes, skills, or TUI):
- Main documentation: ${readmePath}
- Additional docs: ${docsPath}
- Examples: ${examplesPath} (extensions, custom tools, SDK)
- When reading pi docs or examples, resolve docs/... under Additional docs and examples/... under Examples, not the current working directory
- When asked about: extensions (docs/extensions.md, examples/extensions/), themes (docs/themes.md), skills (docs/skills.md), prompt templates (docs/prompt-templates.md), TUI components (docs/tui.md), keybindings (docs/keybindings.md), SDK integrations (docs/sdk.md), custom providers (docs/custom-provider.md), adding models (docs/models.md), pi packages (docs/packages.md)
- When working on pi topics, read the docs and examples, and follow .md cross-references before implementing
- Always read pi .md files completely and follow links to related docs (e.g., tui.md for TUI API details)`;

	return joinPromptSections([
		basePrompt,
		appendSystemPrompt,
		formatProjectContext(contextFiles),
		hasRead ? formatSkillsForPrompt(skills) : undefined,
		formatRuntimeContext(date, promptCwd),
	]);
}
