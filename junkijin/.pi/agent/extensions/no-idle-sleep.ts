import { spawn, type ChildProcess } from "node:child_process";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PID = process.pid;

// Each command keeps idle sleep blocked until it is killed or the Pi process disappears.
const COMMANDS: Partial<Record<NodeJS.Platform, string[]>> = {
	darwin: ["/usr/bin/caffeinate", "-i", "-w", `${PID}`],
	// systemd-inhibit sends SIGTERM to its command when it dies, so tail is cleaned up too.
	linux: ["systemd-inhibit", "--what=idle", "--who=pi", "--why=Pi is running an active agent", "tail", `--pid=${PID}`, "-f", "/dev/null"],
	win32: ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", `
		Add-Type -Namespace Pi -Name Power -MemberDefinition '
			[DllImport("kernel32.dll")] static extern uint SetThreadExecutionState(uint flags);
			public static void KeepAwake() { SetThreadExecutionState(0x80000001); } // ES_CONTINUOUS | ES_SYSTEM_REQUIRED
		'
		[Pi.Power]::KeepAwake()
		Wait-Process -Id ${PID}
	`],
};

export default function (pi: ExtensionAPI) {
	let command = COMMANDS[process.platform];
	let helper: ChildProcess | undefined;

	pi.on("agent_start", (_event, ctx) => {
		if (!command || helper) return;

		const disable = (reason: string) => {
			command = undefined;
			ctx.ui.notify(`no-idle-sleep disabled: ${reason}`, "warning");
		};
		const [file, ...args] = command;
		const child = spawn(file, args, { stdio: "ignore", windowsHide: true });
		// Launch failures arrive as an "error" event, and an unhandled one would crash Pi.
		child.on("error", (error) => disable(error.message));
		// kill() ends the helper with a signal (code null), so a non-zero code is a backend failure.
		child.on("exit", (code) => {
			if (code) disable(`exit ${code}`);
		});
		// A child that failed to launch has no pid; kill() on it signals Pi's own process group.
		if (child.pid !== undefined) helper = child;
	});

	const release = () => {
		helper?.kill();
		helper = undefined;
	};
	pi.on("agent_settled", release);
	pi.on("session_shutdown", release);
}
