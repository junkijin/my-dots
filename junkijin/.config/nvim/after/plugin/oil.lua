vim.keymap.set("n", "-", "<cmd>Oil<cr>")

require("oil").setup({
	keymaps = {
		["<C-h>"] = false,
		["<C-l>"] = false,
		["`"] = false,
		["~"] = false,
	},
})
