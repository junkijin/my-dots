vim.pack.add({ "https://github.com/stevearc/conform.nvim" }, { confirm = false })

vim.o.formatexpr = "v:lua.require'conform'.formatexpr()"
vim.api.nvim_create_autocmd("BufWritePre", {
	group = vim.api.nvim_create_augroup("MyConform", {}),
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
			condition = require("conform.util").root_file({
				".oxfmtrc.json",
				".oxfmtrc.jsonc",
				"oxfmt.config.ts",
				"oxfmt.config.mts",
			}),
		},
		prettier = {
			condition = require("conform.util").root_file({
				".prettierrc",
				".prettierrc.json",
				".prettierrc.yml",
				".prettierrc.yaml",
				".prettierrc.toml",
				".prettierrc.json5",
				".prettierrc.js",
				".prettierrc.ts",
				".prettierrc.mjs",
				".prettierrc.mts",
				".prettierrc.cjs",
				".prettierrc.cts",
				"prettier.config.js",
				"prettier.config.ts",
				"prettier.config.mjs",
				"prettier.config.mts",
				"prettier.config.cjs",
				"prettier.config.cts",
			}),
		},
	},
	notify_no_formatters = false,
})
