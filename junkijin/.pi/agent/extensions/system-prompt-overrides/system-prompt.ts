import type { BuildSystemPromptOptions } from "@earendil-works/pi-coding-agent";
import { existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
	AVAILABLE_SKILLS_PROMPT_TEMPLATE,
	BASE_SYSTEM_PROMPT_TEMPLATE,
	BASH_FILE_OPERATIONS_GUIDELINE,
	DEFAULT_GUIDELINES,
	EMPTY_TOOLS_PROMPT,
	PROJECT_CONTEXT_PROMPT_TEMPLATE,
	RUNTIME_CONTEXT_PROMPT_TEMPLATE,
	renderPromptTemplate,
} from "./prompt-files.ts";

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

	const skillElements: string[] = [];

	for (const skill of visibleSkills) {
		skillElements.push("<skill>");
		skillElements.push(formatXmlElement("name", skill.name));
		skillElements.push(formatXmlElement("description", skill.description));
		skillElements.push(formatXmlElement("location", skill.filePath));
		skillElements.push("</skill>");
	}

	return renderPromptTemplate(AVAILABLE_SKILLS_PROMPT_TEMPLATE, {
		SKILL_ELEMENTS: skillElements.join("\n"),
	});
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

	return renderPromptTemplate(PROJECT_CONTEXT_PROMPT_TEMPLATE, {
		PROJECT_INSTRUCTIONS: contextFiles.map(formatProjectInstruction).join(PROJECT_CONTEXT_SEPARATOR),
	});
}

function formatRuntimeContext(date: string, cwd: string): string {
	return renderPromptTemplate(RUNTIME_CONTEXT_PROMPT_TEMPLATE, { DATE: date, CWD: cwd });
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
		visibleTools.length > 0 ? visibleTools.map((name) => `- ${name}: ${toolSnippets[name]}`).join("\n") : EMPTY_TOOLS_PROMPT;

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
		addGuideline(BASH_FILE_OPERATIONS_GUIDELINE);
	}
	for (const guideline of promptGuidelines ?? []) {
		const normalized = guideline.trim();
		if (normalized.length > 0) addGuideline(normalized);
	}
	for (const guideline of DEFAULT_GUIDELINES) {
		addGuideline(guideline);
	}
	const guidelines = guidelinesList.map((guideline) => `- ${guideline}`).join("\n");

	const basePrompt = renderPromptTemplate(BASE_SYSTEM_PROMPT_TEMPLATE, {
		TOOLS_LIST: toolsList,
		GUIDELINES: guidelines,
		README_PATH: readmePath,
		DOCS_PATH: docsPath,
		EXAMPLES_PATH: examplesPath,
	});

	return joinPromptSections([
		basePrompt,
		appendSystemPrompt,
		formatProjectContext(contextFiles),
		hasRead ? formatSkillsForPrompt(skills) : undefined,
		formatRuntimeContext(date, promptCwd),
	]);
}
