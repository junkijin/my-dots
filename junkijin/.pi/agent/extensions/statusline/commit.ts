import { execFileSync } from "node:child_process";
import { compactWhitespace } from "./text.js";

const MAX_COMMIT_SUBJECT_CHARACTERS = 40;
const ELLIPSIS = "…";
const CACHE_TTL_MS = 1000;

interface CommitSubjectCache {
	cwd: string;
	checkedAt: number;
	subject: string | null;
}

let cache: CommitSubjectCache | null = null;

export function getLatestCommitSubject(cwd: string): string | null {
	const now = Date.now();
	if (cache && cache.cwd === cwd && now - cache.checkedAt < CACHE_TTL_MS) {
		return cache.subject;
	}

	const subject = resolveLatestCommitSubject(cwd);
	cache = { cwd, checkedAt: now, subject };
	return subject;
}

function resolveLatestCommitSubject(cwd: string): string | null {
	try {
		const output = execFileSync("git", ["log", "-1", "--format=%s"], {
			cwd,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
			timeout: 500,
		});
		const firstLine = output.split(/\r?\n/, 1)[0] ?? "";
		const subject = truncateToCharacters(
			compactWhitespace(firstLine),
			MAX_COMMIT_SUBJECT_CHARACTERS,
		);

		return subject || null;
	} catch {
		return null;
	}
}

function truncateToCharacters(text: string, maxCharacters: number): string {
	const characters = Array.from(text);
	if (characters.length <= maxCharacters) return text;
	if (maxCharacters <= ELLIPSIS.length) return ELLIPSIS.slice(0, maxCharacters);

	return characters.slice(0, maxCharacters - ELLIPSIS.length).join("") + ELLIPSIS;
}
