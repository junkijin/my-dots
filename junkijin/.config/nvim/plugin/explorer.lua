vim.pack.add({
	"https://github.com/nvim-tree/nvim-web-devicons",
	"https://github.com/stevearc/oil.nvim",
}, { confirm = false })

vim.keymap.set("n", "-", "<cmd>Oil<cr>")

require("oil").setup({
	keymaps = {
		["<C-h>"] = false,
		["<C-l>"] = false,
		["`"] = false,
		["~"] = false,
	},
})
