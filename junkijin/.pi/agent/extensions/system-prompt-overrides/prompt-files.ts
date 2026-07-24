import { readFileSync } from "node:fs";

const PROMPTS_DIR = new URL("./prompts/", import.meta.url);
const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;

function loadPromptFile(fileName: string): string {
	return readFileSync(new URL(fileName, PROMPTS_DIR), "utf8").trim();
}

export function renderPromptTemplate(template: string, variables: Readonly<Record<string, string>>): string {
	return template.replace(TEMPLATE_PLACEHOLDER_PATTERN, (placeholder, name: string) => {
		if (!(name in variables)) {
			throw new Error(`Missing value for prompt template placeholder ${placeholder}`);
		}

		return variables[name];
	});
}

export const AVAILABLE_SKILLS_PROMPT_TEMPLATE = loadPromptFile("available-skills.md");
export const PROJECT_CONTEXT_PROMPT_TEMPLATE = loadPromptFile("project-contexts.md");
export const RUNTIME_CONTEXT_PROMPT_TEMPLATE = loadPromptFile("runtime-context.md");
