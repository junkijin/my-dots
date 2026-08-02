-- The `main` branch (the default one, and the only one supporting Nvim 0.11+)
-- ships parsers and queries only: highlighting, folding and indenting are
-- Neovim features that have to be enabled per buffer (:h treesitter-highlight).
local parsers = {
	"bash",
	"c",
	"css",
	"diff",
	"eex",
	"elixir",
	"git_config",
	"git_rebase",
	"gitcommit",
	"heex",
	"html",
	"javascript",
	"jsdoc",
	"json",
	"lua",
	"luadoc",
	"markdown",
	"markdown_inline",
	"query",
	"regex",
	"toml",
	"tsx",
	"typescript",
	"vim",
	"vimdoc",
	"yaml",
	"zig",
}

-- A no-op once the parsers are on disk; the first start installs them
-- asynchronously into `stdpath("data")/site`.
require("nvim-treesitter").install(parsers)

-- Parsers are only guaranteed to work with the plugin revision that pinned
-- them, so rebuild them whenever `vim.pack` moves the plugin. The update has to
-- run the code that just landed on disk, hence dropping the stale modules from
-- `package.loaded` first.
vim.api.nvim_create_autocmd("PackChanged", {
	group = vim.api.nvim_create_augroup("my.nvim-treesitter", {}),
	callback = function(event)
		if event.data.spec.name ~= "nvim-treesitter" or event.data.kind ~= "update" then
			return
		end

		for module in pairs(package.loaded) do
			if module == "nvim-treesitter" or vim.startswith(module, "nvim-treesitter.") then
				package.loaded[module] = nil
			end
		end

		require("nvim-treesitter").update()
	end,
})

-- One filetype can map to a differently named parser (`typescriptreact` ->
-- `tsx`), and the plugin registers those pairs when it loads.
vim.api.nvim_create_autocmd("FileType", {
	group = vim.api.nvim_create_augroup("my.nvim-treesitter.highlight", {}),
	pattern = vim.iter(parsers):map(vim.treesitter.language.get_filetypes):flatten():totable(),
	callback = function(event)
		-- Still missing while the initial install runs, and `start()` throws.
		pcall(vim.treesitter.start, event.buf)
	end,
})
