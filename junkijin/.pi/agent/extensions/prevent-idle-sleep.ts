import { spawn, type ChildProcess } from "node:child_process";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const REASON = "Pi is running an active agent";
const PID = String(process.pid);
const WATCH_PARENT = 'while kill -0 "$1" 2>/dev/null; do sleep 1; done';

const WINDOWS_SCRIPT = String.raw`
$ErrorActionPreference = "Stop"
Add-Type @'
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;

public static class PiSleepInhibitor
{
    private const uint SimpleReasonString = 1;
    private const int SystemRequired = 1;

    [StructLayout(LayoutKind.Sequential)]
    private struct ReasonContext
    {
        public uint Version;
        public uint Flags;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string Reason;
    }

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern SafeFileHandle PowerCreateRequest(ref ReasonContext context);
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool PowerSetRequest(SafeFileHandle handle, int type);

    public static void Hold(int parentPid)
    {
        var context = new ReasonContext { Flags = SimpleReasonString, Reason = "${REASON}" };
        // Closing the handle also releases its active power requests.
        using (var handle = PowerCreateRequest(ref context))
        {
            if (handle.IsInvalid || !PowerSetRequest(handle, SystemRequired))
                throw new Win32Exception(Marshal.GetLastWin32Error());

            try
            {
                using (var parent = Process.GetProcessById(parentPid)) parent.WaitForExit();
            }
            catch (ArgumentException) { }
        }
    }
}
'@
[PiSleepInhibitor]::Hold(${PID})
`;

const LINUX_SCRIPT = String.raw`
systemd-inhibit --what=idle --mode=block --who=pi --why='${REASON}' -- /bin/sh -c '${WATCH_PARENT}' pi-sleep-inhibitor ${PID}
gnome-session-inhibit --inhibit idle --reason '${REASON}' /bin/sh -c '${WATCH_PARENT}' pi-sleep-inhibitor ${PID}
`;

const HELPERS: Partial<Record<NodeJS.Platform, [string, string[]]>> = {
	darwin: ["/usr/bin/caffeinate", ["-i", "-w", PID]],
	linux: ["/bin/sh", ["-c", LINUX_SCRIPT]],
	win32: ["powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_SCRIPT]],
};
const HELPER = HELPERS[process.platform];

export default function (pi: ExtensionAPI) {
	let child: ChildProcess | undefined;
	let failureReported = false;

	const reportFailure = (detail: string) => {
		if (failureReported) return;
		process.stderr.write(`[prevent-idle-sleep] No sleep-inhibition backend is available: ${detail}\n`);
		failureReported = true;
	};

	const start = () => {
		if (!HELPER || child) return;

		let current: ChildProcess;
		try {
			current = spawn(...HELPER, {
				detached: process.platform === "linux",
				stdio: "ignore",
				windowsHide: true,
			});
		} catch (error) {
			reportFailure(String(error));
			return;
		}

		child = current;
		current.unref();
		const stopped = (detail: string) => {
			if (child !== current) return;
			child = undefined;
			reportFailure(detail);
		};
		current.once("error", (error) => stopped(error.message));
		current.once("exit", (code, signal) => stopped(signal ? `signal ${signal}` : `exit ${code ?? "unknown"}`));
	};

	const stop = () => {
		const current = child;
		child = undefined;
		if (!current || current.exitCode !== null || current.signalCode !== null) return;

		try {
			if (process.platform === "linux" && current.pid !== undefined) process.kill(-current.pid, "SIGTERM");
			else current.kill();
		} catch {
			try {
				current.kill();
			} catch { }
		}
	};

	pi.on("agent_start", start);
	pi.on("agent_settled", stop);
	pi.on("session_shutdown", stop);
}
