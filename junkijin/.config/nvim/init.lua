vim.loader.enable()

-- Bootstrap
vim.g.mapleader = " "

-- Options
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
vim.opt.list = false
vim.opt.title = true
vim.opt.titlestring = '%t%( %M%)%( (%{expand("%:~:.:h")})%)'

-- LSP
vim.diagnostic.config({
	signs = false,
})

vim.lsp.enable({
	"eslint",
	"tailwindcss",
	"vtsls",
	"zls",
})

-- Commands
vim.cmd("cnoreabbrev W w")
vim.cmd("cnoreabbrev Q q")
vim.cmd("cnoreabbrev Wq wq")
vim.cmd("cnoreabbrev wQ wq")
vim.cmd("cnoreabbrev WQ wq")
vim.cmd("cnoreabbrev Wa wa")
vim.cmd("cnoreabbrev wA wa")
vim.cmd("cnoreabbrev WA wa")
vim.cmd("cnoreabbrev Qa qa")
vim.cmd("cnoreabbrev qA qa")
vim.cmd("cnoreabbrev QA qa")

-- Navigation
vim.keymap.set("n", "]t", "<Cmd>tabn<CR>")
vim.keymap.set("n", "[t", "<Cmd>tabp<CR>")
vim.keymap.set("n", "<ESC>", "<Cmd>noh<CR>")
