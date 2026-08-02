-- `src` must match `nvim-pack-lock.json` verbatim: on mismatch `vim.pack`
-- deletes the plugin and reinstalls it from the new source.
--
-- `load` defaults to `false` while init.lua is being sourced (:h vim.pack.add),
-- which would defer each plugin's `plugin/` scripts until after our own. Set it
-- explicitly so plugins are fully usable from `plugin/*.lua`.
vim.pack.add({
	{ src = "https://github.com/saghen/blink.cmp", version = vim.version.range("1.*") },
	"https://github.com/stevearc/conform.nvim",
	"https://github.com/ibhagwan/fzf-lua",
	"https://github.com/sainnhe/gruvbox-material", -- config: colors/junki.lua
	"https://github.com/NMAC427/guess-indent.nvim",
	"https://codeberg.org/andyg/leap.nvim",
	"https://github.com/nvim-lualine/lualine.nvim",
	"https://github.com/windwp/nvim-autopairs",
	"https://github.com/kevinhwang91/nvim-bqf", -- + highlight: colors/junki.lua
	"https://github.com/neovim/nvim-lspconfig",
	"https://github.com/kylechui/nvim-surround",
	"https://github.com/nvim-treesitter/nvim-treesitter",
	"https://github.com/nvim-tree/nvim-web-devicons",
	"https://github.com/stevearc/oil.nvim",
	"https://github.com/folke/persistence.nvim",
	"https://github.com/mrjones2014/smart-splits.nvim",
	"https://github.com/wellle/targets.vim",
	"https://github.com/haya14busa/vim-asterisk",
	"https://github.com/elixir-editors/vim-elixir.git",
	"https://github.com/tpope/vim-repeat",
	"https://codeberg.org/ziglang/zig.vim.git",
}, {
	load = true,
	confirm = false,
})

-- fugitive reads `g:fugitive_legacy_commands` while its own `plugin/` scripts
-- are sourced, which is too late to set from `plugin/`. Put it on
-- 'runtimepath' here and let plugin/vim-fugitive.lua do the loading.
vim.pack.add({
	"https://github.com/tpope/vim-fugitive",
}, {
	load = false,
	confirm = false,
})
