return {
	settings = {
		javascript = {
			updateImportsOnFileMove = {
				enabled = "always",
			},
		},
		typescript = {
			updateImportsOnFileMove = {
				enabled = "always",
			},
			tsserver = {
				pluginPaths = { "./node_modules" },
			},
		},
		vtsls = {
			enableMoveToFileCodeAction = true,
			autoUseWorkspaceTsdk = true,
			tsserver = {
				globalPlugins = {
					{
						name = "@styled/typescript-styled-plugin",
						enableForWorkspaceTypeScriptVersions = true,
					},
				},
			},
		},
	},
}
