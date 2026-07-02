import { getAgentDir, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { appendPrompt, buildSystemPrompt } from "./system-prompt.ts";

const MODEL_PROMPTS_DIR = "model-prompts";

type ModelPromptFile = {
	models: string[];
	body: string;
};

type WarningKey = string;

const warned = new Set<WarningKey>();

function normalizeNewlines(value: string): string {
	return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function parseModelPromptFile(content: string): { models: string[]; body: string } | undefined {
	const normalized = normalizeNewlines(content);
	if (!normalized.startsWith("---\n")) return undefined;

	const endIndex = normalized.indexOf("\n---", 4);
	if (endIndex === -1) return undefined;

	const frontmatter = normalized.slice(4, endIndex);
	const body = normalized.slice(endIndex + 4).trim();
	const models = parseModels(frontmatter);

	if (models.length === 0 || body.length === 0) return undefined;
	return { models, body };
}

function parseModels(frontmatter: string): string[] {
	const lines = frontmatter.split("\n");
	const models: string[] = [];
	let inModels = false;

	for (const line of lines) {
		const trimmed = line.trim();

		if (trimmed.startsWith("models:")) {
			const inlineValue = trimmed.slice("models:".length).trim();
			if (inlineValue.length > 0) {
				models.push(...parseInlineModels(inlineValue));
				inModels = false;
			} else {
				inModels = true;
			}
			continue;
		}

		if (!inModels) continue;

		if (trimmed.length === 0 || trimmed.startsWith("#")) continue;

		if (!trimmed.startsWith("- ")) {
			// A new frontmatter key started. Only the `models` array is supported.
			break;
		}

		const value = normalizeYamlScalar(trimmed.slice(2).trim());
		if (value) models.push(value);
	}

	return Array.from(new Set(models));
}

function parseInlineModels(value: string): string[] {
	const normalized = stripInlineComment(value).trim();
	if (!normalized.startsWith("[") || !normalized.endsWith("]")) return [];

	return splitInlineList(normalized.slice(1, -1))
		.map((item) => normalizeYamlScalar(item))
		.filter((item) => item.length > 0);
}

function splitInlineList(value: string): string[] {
	const items: string[] = [];
	let current = "";
	let quote: '"' | "'" | undefined;

	for (const char of value) {
		if (quote) {
			current += char;
			if (char === quote) quote = undefined;
			continue;
		}

		if (char === '"' || char === "'") {
			quote = char;
			current += char;
			continue;
		}

		if (char === ",") {
			items.push(current.trim());
			current = "";
			continue;
		}

		current += char;
	}

	items.push(current.trim());
	return items;
}

function normalizeYamlScalar(value: string): string {
	const withoutComment = stripInlineComment(value).trim();
	if (withoutComment.length < 2) return withoutComment;

	const first = withoutComment[0];
	const last = withoutComment[withoutComment.length - 1];

	if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
		return withoutComment.slice(1, -1).trim();
	}

	return withoutComment;
}

function stripInlineComment(value: string): string {
	let quote: '"' | "'" | undefined;

	for (let index = 0; index < value.length; index += 1) {
		const char = value[index];

		if (quote) {
			if (char === quote) quote = undefined;
			continue;
		}

		if (char === '"' || char === "'") {
			quote = char;
			continue;
		}

		if (char === "#" && (index === 0 || /\s/.test(value[index - 1]))) {
			return value.slice(0, index).trimEnd();
		}
	}

	return value;
}

function notifyWarningOnce(ctx: ExtensionContext, key: string, message: string): void {
	if (warned.has(key)) return;
	warned.add(key);

	if (ctx.hasUI) {
		ctx.ui.notify(message, "warning");
	}
}

async function loadModelPromptFiles(rootDir: string, ctx: ExtensionContext): Promise<ModelPromptFile[]> {
	let entries;
	try {
		entries = await readdir(rootDir, { withFileTypes: true });
	} catch {
		return [];
	}

	const files = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
		.map((entry) => entry.name)
		.sort((a, b) => a.localeCompare(b));

	const prompts: ModelPromptFile[] = [];

	for (const fileName of files) {
		const filePath = join(rootDir, fileName);

		try {
			const content = await readFile(filePath, "utf8");
			const parsed = parseModelPromptFile(content);
			if (!parsed) continue;

			prompts.push(parsed);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			notifyWarningOnce(ctx, `read:${filePath}:${message}`, `Failed to load model prompt ${filePath}: ${message}`);
		}
	}

	return prompts;
}

export default function systemPromptOverridesExtension(pi: ExtensionAPI) {
	pi.on("before_agent_start", async (event, ctx) => {
		const matchedBodies: string[] = [];
		const model = ctx.model;

		if (model) {
			const modelKey = `${model.provider}/${model.id}`;
			const roots = [resolve(getAgentDir(), MODEL_PROMPTS_DIR)];

			if (ctx.isProjectTrusted()) {
				roots.push(resolve(ctx.cwd, ".pi", MODEL_PROMPTS_DIR));
			}

			for (const root of roots) {
				const promptFiles = await loadModelPromptFiles(root, ctx);
				for (const promptFile of promptFiles) {
					if (promptFile.models.includes(modelKey)) {
						matchedBodies.push(promptFile.body);
					}
				}
			}
		}

		const additionalPrompt = matchedBodies.join("\n\n");

		return {
			systemPrompt: buildSystemPrompt({
				...event.systemPromptOptions,
				appendSystemPrompt: additionalPrompt
					? appendPrompt(event.systemPromptOptions.appendSystemPrompt, additionalPrompt)
					: event.systemPromptOptions.appendSystemPrompt,
			}),
		};
	});
}
