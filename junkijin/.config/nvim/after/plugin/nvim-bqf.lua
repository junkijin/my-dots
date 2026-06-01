local function set_highlight()
	vim.api.nvim_set_hl(0, "BqfPreviewBorder", { link = "Ignore" })
end

vim.api.nvim_create_autocmd("ColorScheme", {
	group = vim.api.nvim_create_augroup("my.nvim-bqf", {}),
	callback = set_highlight,
})
set_highlight()

require("bqf").setup({})
