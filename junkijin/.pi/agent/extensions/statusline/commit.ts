import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const GIT_TIMEOUT_MS = 3000;

export interface GitStatusSnapshot {
	branch: string | null;
	dirtyFileCount: number;
	latestCommitSubject: string | null;
}

const EMPTY_GIT_STATUS: GitStatusSnapshot = {
	branch: null,
	dirtyFileCount: 0,
	latestCommitSubject: null,
};

/**
 * Session-scoped, non-blocking Git metadata cache.
 *
 * Refreshes are coalesced so bursts of tool events never start overlapping
 * status processes. Rendering only reads the last completed snapshot.
 */
export class GitStatusCache {
	private snapshot: GitStatusSnapshot = EMPTY_GIT_STATUS;
	private refreshInFlight = false;
	private refreshPending = false;
	private disposed = false;
	private generation = 0;
	private abortController: AbortController | null = null;

	constructor(
		private readonly pi: Pick<ExtensionAPI, "exec">,
		private readonly cwd: string,
		private readonly onChange: () => void,
	) {}

	getSnapshot(): GitStatusSnapshot {
		return this.snapshot;
	}

	refresh(): void {
		if (this.disposed) return;
		if (this.refreshInFlight) {
			this.refreshPending = true;
			return;
		}

		this.refreshInFlight = true;
		const generation = this.generation;
		const abortController = new AbortController();
		this.abortController = abortController;

		void this.resolveSnapshot(abortController.signal)
			.then((snapshot) => {
				if (!snapshot || this.disposed || generation !== this.generation) return;
				if (sameSnapshot(this.snapshot, snapshot)) return;

				this.snapshot = snapshot;
				this.onChange();
			})
			.catch(() => {
				// Git metadata is optional. Preserve the last good snapshot on transient failures.
			})
			.finally(() => {
				if (generation !== this.generation) return;

				this.refreshInFlight = false;
				this.abortController = null;
				if (this.refreshPending && !this.disposed) {
					this.refreshPending = false;
					this.refresh();
				}
			});
	}

	dispose(): void {
		if (this.disposed) return;
		this.disposed = true;
		this.generation += 1;
		this.refreshPending = false;
		this.abortController?.abort();
		this.abortController = null;
	}

	private async resolveSnapshot(signal: AbortSignal): Promise<GitStatusSnapshot | null> {
		const [statusResult, commitResult] = await Promise.all([
			this.pi.exec(
				"git",
				["--no-optional-locks", "status", "--porcelain=v2", "--branch", "-z", "--untracked-files=all"],
				{ cwd: this.cwd, signal, timeout: GIT_TIMEOUT_MS },
			),
			this.pi.exec("git", ["--no-optional-locks", "log", "-1", "--format=%s"], {
				cwd: this.cwd,
				signal,
				timeout: GIT_TIMEOUT_MS,
			}),
		]);

		if (signal.aborted || statusResult.killed || statusResult.code !== 0) return null;

		const { branch, dirtyFileCount } = parsePorcelainStatus(statusResult.stdout);
		const latestCommitSubject =
			!commitResult.killed && commitResult.code === 0
				? (commitResult.stdout.split(/\r?\n/, 1)[0]?.trim() || null)
				: null;

		return { branch, dirtyFileCount, latestCommitSubject };
	}
}

function parsePorcelainStatus(output: string): Pick<GitStatusSnapshot, "branch" | "dirtyFileCount"> {
	let branch: string | null = null;
	let dirtyFileCount = 0;

	for (const record of output.split("\0")) {
		if (record.startsWith("# branch.head ")) {
			const head = record.slice("# branch.head ".length);
			branch = head === "(detached)" ? "detached" : head || null;
			continue;
		}

		// Porcelain v2 records 1, 2, u and ? each represent one changed path.
		// A rename's following NUL record is only the original path and has no prefix.
		if (/^(?:1|2|u|\?) /.test(record)) dirtyFileCount += 1;
	}

	return { branch, dirtyFileCount };
}

function sameSnapshot(left: GitStatusSnapshot, right: GitStatusSnapshot): boolean {
	return (
		left.branch === right.branch &&
		left.dirtyFileCount === right.dirtyFileCount &&
		left.latestCommitSubject === right.latestCommitSubject
	);
}
