return {
	workspace_required = true,
	root_markers = {
		"tailwind.config.js",
		"tailwind.config.cjs",
		"tailwind.config.mjs",
		"tailwind.config.ts",
		"postcss.config.js",
		"postcss.config.cjs",
		"postcss.config.mjs",
		"postcss.config.ts",
	},
	settings = {
		tailwindCSS = {
			classFunctions = { "cva", "cx", "cn" },
		},
	},
}
