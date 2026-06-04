require("lualine").setup({
	options = {
		component_separators = "",
		section_separators = "",
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
		},
		lualine_y = {
			"%l:%v",
		},
		lualine_z = {},
	},
	extensions = {
		"fzf",
		"man",
		"oil",
		"quickfix",
	},
})
