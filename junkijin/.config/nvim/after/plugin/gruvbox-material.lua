vim.g.gruvbox_material_foreground = "original"
vim.g.gruvbox_material_background = "medium"
vim.g.gruvbox_material_enable_bold = 1
vim.g.gruvbox_material_enable_italic = 1

vim.api.nvim_create_autocmd("ColorScheme", {
	group = vim.api.nvim_create_augroup("my.nvim-bqf", {}),
	callback = function()
		vim.api.nvim_set_hl(0, "BqfPreviewBorder", { link = "Ignore" })
	end,
})

vim.cmd.colorscheme("gruvbox-material")
