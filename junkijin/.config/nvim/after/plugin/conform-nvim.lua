local util = require("conform.util")

local oxfmt_config_files = {
	".oxfmtrc.json",
	".oxfmtrc.jsonc",
	"oxfmt.config.ts",
}

vim.o.formatexpr = "v:lua.require'conform'.formatexpr()"
vim.api.nvim_create_autocmd("BufWritePre", {
	group = vim.api.nvim_create_augroup("my.conform", {}),
	callback = function(evt)
		require("conform").format({ bufnr = evt.buf })
	end,
})

require("conform").setup({
	formatters_by_ft = {
		lua = { "stylua" },
		javascript = { "oxfmt", "prettier", stop_after_first = true },
		javascriptreact = { "oxfmt", "prettier", stop_after_first = true },
		typescript = { "oxfmt", "prettier", stop_after_first = true },
		typescriptreact = { "oxfmt", "prettier", stop_after_first = true },
	},
	formatters = {
		oxfmt = {
			condition = util.root_file(oxfmt_config_files),
			cwd = util.root_file(oxfmt_config_files),
		},
		prettier = {
			condition = util.root_file({
				".prettierrc",
				".prettierrc.json",
				".prettierrc.yml",
				".prettierrc.yaml",
				".prettierrc.json5",
				".prettierrc.js",
				"prettier.config.js",
				".prettierrc.ts",
				"prettier.config.ts",
				".prettierrc.mjs",
				"prettier.config.mjs",
				".prettierrc.mts",
				"prettier.config.mts",
				".prettierrc.cjs",
				"prettier.config.cjs",
				".prettierrc.cts",
				"prettier.config.cts",
				".prettierrc.toml",
			}),
		},
	},
	notify_no_formatters = false,
})
