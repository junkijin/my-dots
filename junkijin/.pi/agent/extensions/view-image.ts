import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import {
	createReadToolDefinition,
	detectSupportedImageMimeTypeFromFile,
	type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const TOOL = "view_image";

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: TOOL,
		label: TOOL,
		description:
			"View a local image file (jpg, png, gif, webp, bmp) when visual inspection is needed. Other file types are rejected; read text files with bash.",
		parameters: Type.Object({
			path: Type.String({ description: "Path to the image file (relative or absolute)" }),
		}),
		async execute(toolCallId, params, signal, onUpdate, ctx) {
			// Reuse the built-in read tool (path resolution, resizing, vision checks) but refuse non-images.
			const read = createReadToolDefinition(ctx.cwd, {
				operations: {
					readFile: (path) => readFile(path),
					access: (path) => access(path, constants.R_OK),
					detectImageMimeType: async (path) => {
						const mimeType = await detectSupportedImageMimeTypeFromFile(path);
						if (!mimeType) throw new Error(`Not a supported image file: ${path}. Use bash to read text files.`);
						return mimeType;
					},
				},
			});
			return read.execute(toolCallId, { path: params.path }, signal, onUpdate, ctx);
		},
	});

	// view_image duplicates read's image support, so keep it active only while read is inactive.
	// There is no "active tools changed" event, so re-check before every prompt.
	const sync = () => {
		const active = pi.getActiveTools();
		const readActive = active.includes("read");
		const viewActive = active.includes(TOOL);
		if (readActive && viewActive) {
			pi.setActiveTools(active.filter((name) => name !== TOOL));
		} else if (!readActive && !viewActive && pi.getAllTools().some((tool) => tool.name === TOOL)) {
			// getAllTools() omits tools removed by --tools/--exclude-tools, so CLI exclusions stay respected.
			pi.setActiveTools([...active, TOOL]);
		}
	};
	pi.on("session_start", sync);
	pi.on("before_agent_start", sync);
}
