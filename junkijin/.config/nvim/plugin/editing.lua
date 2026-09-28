vim.pack.add({
	"https://github.com/NMAC427/guess-indent.nvim",
	"https://github.com/windwp/nvim-autopairs",
	"https://github.com/kylechui/nvim-surround",
	"https://github.com/wellle/targets.vim",
	"https://github.com/tpope/vim-repeat",
}, { confirm = false })

require("guess-indent").setup()
require("nvim-autopairs").setup()
require("nvim-surround").setup()
