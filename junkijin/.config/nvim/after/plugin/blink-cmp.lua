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
	},
	sources = {
		default = { "lsp", "snippets" },
	},
})
