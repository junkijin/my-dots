vim.g.gruvbox_material_foreground = "original"
vim.g.gruvbox_material_background = "medium"
vim.g.gruvbox_material_enable_bold = 1
vim.g.gruvbox_material_enable_italic = 1

-- `:colorscheme` refuses to recurse, so the base scheme is sourced directly.
-- It sets `g:colors_name = "gruvbox-material"`, which is what lualine's `auto`
-- theme resolves against.
vim.cmd("runtime colors/gruvbox-material.vim")

vim.api.nvim_set_hl(0, "BqfPreviewBorder", { link = "Ignore" })
