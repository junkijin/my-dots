vim.pack.add({
	{ src = "https://github.com/saghen/blink.cmp", version = vim.version.range("1.*") },
}, { confirm = false })

vim.opt.completeopt:append("fuzzy")

require("blink.cmp").setup({
	keymap = {
		preset = "default",
		["<Esc>"] = {
			function()
				vim.snippet.stop()
			end,
			"fallback",
		},
	},
	completion = {
		accept = {
			dot_repeat = false,
			auto_brackets = {
				enabled = false,
			},
		},
		list = {
			selection = {
				auto_insert = false,
			},
		},
		documentation = {
			treesitter_highlighting = false,
		},
	},
	sources = {
		default = { "lsp", "snippets" },
	},
})
