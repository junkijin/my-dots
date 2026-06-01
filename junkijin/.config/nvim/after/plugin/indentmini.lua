require("indentmini").setup({
	exclude = { "markdown", "help", "text", "rst", "oil", "gitcommit", "fugitive" },
	exclude_nodetype = { "string", "comment" },
})

local function set_highlight()
	vim.api.nvim_set_hl(0, "IndentLine", { link = "NonText" })
	vim.api.nvim_set_hl(0, "IndentLineCurrent", { link = "NonText" })
end

vim.api.nvim_create_autocmd("ColorScheme", {
	group = vim.api.nvim_create_augroup("my.indentmini", {}),
	callback = set_highlight,
})
set_highlight()
