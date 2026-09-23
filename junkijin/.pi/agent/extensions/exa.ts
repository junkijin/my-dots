import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_LINES,
	type ExtensionAPI,
	formatSize,
	type Theme,
	truncateHead,
} from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";

// Exa's hosted MCP server is the only Exa endpoint usable without an API key (free, rate-limited).
const ENDPOINT = "https://mcp.exa.ai/mcp";
const LIMITS = `Output is truncated to ${DEFAULT_MAX_LINES} lines or ${formatSize(DEFAULT_MAX_BYTES)}; if truncated, the full output is saved to a temp file.`;

// The server answers a bare tools/call without initialize or a session, so one request is enough.
async function callExa(name: string, args: object, signal?: AbortSignal): Promise<string> {
	const response = await fetch(ENDPOINT, {
		method: "POST",
		headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
		body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }),
		signal,
	});
	const body = await response.text();
	if (!response.ok) throw new Error(`Exa MCP ${response.status}: ${body.slice(0, 200)}`);
	// Streamable HTTP replies with SSE ("data: {...}") or plain JSON.
	const message = JSON.parse(body.split("\n").findLast((line) => line.startsWith("data: "))?.slice(6) ?? body);
	if (message.error) throw new Error(`Exa MCP: ${message.error.message}`);
	const text = (message.result.content as { text?: string }[]).map((part) => part.text ?? "").join("\n");
	if (message.result.isError) throw new Error(text);
	return text;
}

async function output(text: string): Promise<string> {
	const truncation = truncateHead(text);
	if (!truncation.truncated) return truncation.content;
	const file = join(await mkdtemp(join(tmpdir(), "pi-exa-")), "output.md");
	await writeFile(file, text, "utf8");
	return `${truncation.content}\n\n[Output truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines (${formatSize(truncation.outputBytes)} of ${formatSize(truncation.totalBytes)}). Full output saved to: ${file}]`;
}

// Same shape as the built-in read call line: bold tool name, then the argument on one line.
function callLine(name: string, value: string | undefined, theme: Theme, lastComponent: unknown) {
	const text = (lastComponent as Text | undefined) ?? new Text("", 0, 0);
	text.setText(`${theme.fg("toolTitle", theme.bold(name))} ${theme.fg("accent", value?.replace(/\s+/g, " ").trim() || "...")}`);
	return text;
}

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "web_search",
		label: "web_search",
		description: `Search the web with Exa and return the top results with title, URL, and query-relevant highlights. Use web_fetch to read a result in full. ${LIMITS}`,
		parameters: Type.Object({
			query: Type.String({
				description: 'Natural language description of the ideal page, not just keywords, e.g. "blog post comparing React and Vue performance"',
			}),
		}),
		async execute(_toolCallId, params, signal) {
			// objective is required by web_search_exa; the query already states the goal.
			const text = await callExa("web_search_exa", { query: params.query, objective: params.query }, signal);
			return { content: [{ type: "text", text: text.trim() ? await output(text) : `No results for "${params.query}"` }], details: {} };
		},
		renderCall: (args, theme, context) => callLine("web_search", args.query, theme, context.lastComponent),
	});

	pi.registerTool({
		name: "web_fetch",
		label: "web_fetch",
		description: `Read a web page by URL with Exa and return its content as clean markdown. ${LIMITS}`,
		parameters: Type.Object({
			url: Type.String({ description: "URL of the page to read" }),
		}),
		async execute(_toolCallId, params, signal) {
			// The server default is 3000 characters per page; request the whole page and let output() cut it.
			const text = await callExa("web_fetch_exa", { urls: [params.url], maxCharacters: 1_000_000 }, signal);
			return { content: [{ type: "text", text: text.trim() ? await output(text) : `No content for ${params.url}` }], details: {} };
		},
		renderCall: (args, theme, context) => callLine("web_fetch", args.url, theme, context.lastComponent),
	});
}
