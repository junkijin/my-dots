vim.opt.termguicolors = true
vim.opt.updatetime = 256
vim.opt.visualbell = true
vim.opt.scrolloff = 3
vim.opt.colorcolumn = "+0"
vim.opt.clipboard = "unnamedplus"
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.swapfile = false
vim.opt.writebackup = false
vim.opt.number = true
vim.opt.signcolumn = "number"
vim.opt.background = "dark"
vim.opt.showtabline = 0
vim.opt.laststatus = 3
vim.opt.grepprg = "rg --vimgrep"
vim.opt.grepformat = "%f:%l:%c:%m"
vim.opt.pumheight = 10
vim.opt.pumwidth = 32
vim.opt.splitright = true
vim.opt.title = true
vim.opt.titlestring = '%t%( %M%)%( (%{expand("%:~:.:h")})%)'

vim.diagnostic.config({
	signs = false,
})
