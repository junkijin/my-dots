import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import * as os from "node:os";
import { type ExtensionAPI, type ExtensionContext, getShellConfig, SettingsManager } from "@earendil-works/pi-coding-agent";

// Every probe can fail (missing command or file, nonzero exit, timeout, unsupported platform); treat all failures as unknown.
function attempt<T>(probe: () => T): T | undefined {
	try {
		return probe();
	} catch {
		return undefined;
	}
}

// Probes run synchronously once per session; together they take about 15 ms.
function firstLine(command: string, ...args: string[]): string {
	const stdout = execFileSync(command, args, { encoding: "utf8", timeout: 2000, stdio: ["ignore", "pipe", "ignore"] });
	return stdout.split("\n")[0].trim();
}

// Kernel versions alone do not tell the macOS version or the Linux distribution.
function productName(): string | undefined {
	switch (process.platform) {
		case "darwin":
			return `macOS ${firstLine("sw_vers", "-productVersion")}`;
		case "linux":
			return readFileSync("/etc/os-release", "utf8").match(/^PRETTY_NAME=(["']?)(.+)\1$/m)?.[2];
		case "win32":
			return os.version();
	}
}

function describeShell(shell: string): string {
	const version = attempt(() => firstLine(shell, "--version"));
	return version ? `${shell} (${version})` : shell;
}

function collect(ctx: ExtensionContext): string {
	const kernel = `${os.type()} ${os.release()}`;
	const name = attempt(productName);
	// The bash tool picks its shell from the shellPath setting, so resolve it the same way.
	const bash = attempt(() => {
		const settings = SettingsManager.create(ctx.cwd, undefined, { projectTrusted: ctx.isProjectTrusted() });
		return getShellConfig(settings.getShellPath()).shell;
	});
	const [source, user] = process.env.SHELL
		? ["$SHELL", process.env.SHELL]
		: ["login shell", attempt(() => os.userInfo().shell)];
	return [
		`Operating system: ${name ? `${name} (${kernel}, ${os.arch()})` : `${kernel} (${os.arch()})`}`,
		bash && `Bash tool shell: ${describeShell(bash)}`,
		user && `User shell (${source}): ${describeShell(user)}`,
	]
		.filter(Boolean)
		.join("\n");
}

export default function (pi: ExtensionAPI) {
	// Prompt options are rebuilt for every run, so set the section each time; leaving it out would remove it.
	// Collect once per extension instance so the section stays identical and Pi sends no prompt patch.
	let environment: string | undefined;
	pi.on("before_agent_start", (event, ctx) => {
		event.systemPromptOptions.sections.environment = environment ??= collect(ctx);
	});
}
