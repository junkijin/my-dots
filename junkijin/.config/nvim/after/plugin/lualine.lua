local disabled_winbar_filetypes = {
	"prompt",
	"packer",
	"help",
	"far",
	"fugitive",
	"qf",
	"mason",
	"TelescopePrompt",
	"checkhealth",
	"vim",
}

local function get_search_query(path)
	return "^" .. path:gsub("([%(%)%.%%%+%-%*%?%[%]%^$])", "%%%1") .. "/"
end
local function get_simple_path(current)
	local cwd = vim.fn.getcwd()
	local search_query = get_search_query(cwd)
	if current:find(search_query) ~= nil then
		local parent_path = vim.fn.fnamemodify(cwd, ":h")
		local parent_search_query = get_search_query(parent_path)
		return current:gsub(parent_search_query, "")
	end
	return ""
end
local function get_oil_icon()
	local current = require("oil").get_current_dir()
	return get_simple_path(current) ~= "" and " " or " "
end
local function get_oil_path()
	local current = require("oil").get_current_dir()
	local simple = get_simple_path(current)
	return simple == "" and current or simple
end

require("lualine").setup({
	options = {
		component_separators = "",
		section_separators = "",
		globalstatus = true,
		disabled_filetypes = {
			winbar = disabled_winbar_filetypes,
		},
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
			{
				"tabs",
				show_modified_status = false,
			},
		},
		lualine_x = {
			"%l:%v",
		},
		lualine_y = {
			{
				"filetype",
				icons_enabled = false,
				fmt = function(filetype)
					if filetype == "" then
						return "unknown"
					end

					return filetype
				end,
			},
		},
		lualine_z = {},
	},
	winbar = {
		lualine_c = {
			{
				"filetype",
				color = { bg = "bg" },
				colored = true,
				icon_only = true,
				fmt = function(str)
					if str == "" then
						return "󰈙"
					end
					return str
				end,
			},
			{
				"filename",
				color = { fg = "#928374", bg = "bg" },
				padding = { left = 0, right = 1 },
			},
			{
				"diagnostics",
				color = { fg = "#928374", bg = "bg" },
				symbols = { error = "", warn = "", info = "", hint = "" },
			},
		},
	},
	inactive_winbar = {
		lualine_c = {
			{
				"filetype",
				colored = false,
				icon_only = true,
				fmt = function(str)
					if str == "" then
						return "󰈙"
					end
					return str
				end,
				color = { fg = "#5a524c", bg = "bg" },
			},
			{
				"filename",
				color = { fg = "#5a524c", bg = "bg" },
				padding = { left = 0, right = 1 },
			},
		},
	},
	extensions = {
		"fzf",
		"man",
		"quickfix",
		"mason",
		{
			filetypes = {
				"oil",
			},
			winbar = {
				lualine_c = {
					{
						get_oil_icon,
						color = { fg = "#b8bb26", bg = "bg" },
					},
					{
						get_oil_path,
						color = { fg = "#928374", bg = "bg" },
						padding = { left = 0, right = 1 },
					},
				},
			},
			inactive_winbar = {
				lualine_c = {
					{
						get_oil_icon,
						color = { fg = "#5a524c", bg = "bg" },
					},
					{
						get_oil_path,
						color = { fg = "#5a524c", bg = "bg" },
						padding = { left = 0, right = 1 },
					},
				},
			},
		},
	},
})
