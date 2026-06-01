vim.keymap.set("n", "+", "<Cmd>FzfLua buffers<CR>")
vim.keymap.set("n", "<leader>f", "<Cmd>FzfLua files<CR>")
vim.keymap.set("n", "<leader>g", "<Cmd>FzfLua live_grep<CR>")

require("fzf-lua").setup({
	winopts = {
		border = "thicc",
		backdrop = 100,
		preview = {
			hidden = "hidden",
		},
	},
	grep = {
		winopts = {
			preview = {
				layout = "vertical",
				hidden = false,
				vertical = "down:70%",
			},
		},
	},
	keymap = {
		fzf = {
			false,
			["ctrl-q"] = "select-all+accept",
			["ctrl-w"] = "accept",
		},
	},
})
