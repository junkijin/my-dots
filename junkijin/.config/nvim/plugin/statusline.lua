vim.pack.add({ "https://github.com/nvim-lualine/lualine.nvim" }, { confirm = false })

-- The `auto` theme resolves against `g:colors_name` at setup, which
-- plugin/colorscheme.lua (sourced earlier, :h load-plugins) has already set.
require("lualine").setup({
	options = {
		icons_enabled = false,
		component_separators = "",
		section_separators = "",
		always_show_tabline = false,
		globalstatus = true,
	},
	sections = {
		lualine_a = {
			{
				function()
					return " "
				end,
				padding = {
					left = 0,
					right = 0,
				},
			},
		},
		lualine_b = {
			{
				"branch",
				icon = "",
			},
		},
		lualine_c = {
			"filename",
		},
		lualine_x = {
			{
				"diagnostics",
				symbols = { error = "", warn = "", info = "", hint = "" },
			},
			"encoding",
			"fileformat",
		},
		lualine_y = {
			"%l:%v",
		},
		lualine_z = {},
	},
	tabline = {
		lualine_a = {
			{
				"tabs",
				mode = 1,
			},
		},
	},
	extensions = {
		"fzf",
		"oil",
		"quickfix",
	},
})
