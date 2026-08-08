-- The `main` branch (the repository default, requires Nvim 0.12; `master` is
-- frozen for 0.11) ships parsers and queries only. Highlighting is a Neovim
-- feature, indenting comes from the plugin, and neither turns itself on
-- (:h treesitter-highlight).
local parsers = {
	"bash",
	"css",
	"diff",
	"git_config",
	"git_rebase",
	"gitcommit",
	"html",
	"javascript",
	"jsdoc",
	"json",
	"lua",
	"luadoc",
	"markdown",
	"markdown_inline",
	"regex",
	"toml",
	"tsx",
	"typescript",
	"vim",
	"vimdoc",
	"yaml",
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

-- Runtime `indent/` scripts (plus the ones vim-elixir and zig.vim ship) own
-- 'indentexpr' and would fight with treesitter for it, so turn them off
-- wholesale. Buffers treesitter does not indent keep 'autoindent' only.
vim.cmd("filetype indent off")

-- 'indentexpr' only runs for the keys in 'indentkeys', and its default value
-- covers `}`, `)` and `]` but none of the keywords or closing tags that end a
-- block. Those were contributed by the `indent/` scripts just turned off.
local extra_indentkeys = {
	bash = { "0=then", "0=do", "0=else", "0=elif", "0=fi", "0=esac", "0=done", "0=;;" },
	elixir = { "0=end", "0=catch", "0=rescue", "0=after" },
	heex = { "<>>" },
	html = { "<>>" },
	javascript = { "<>>" },
	lua = { "0=end", "0=until" },
	tsx = { "<>>" },
}

-- One filetype can map to a differently named parser (`typescriptreact` ->
-- `tsx`), and the plugin registers those pairs when it loads.
vim.api.nvim_create_autocmd("FileType", {
	group = vim.api.nvim_create_augroup("my.nvim-treesitter.enable", {}),
	pattern = vim.iter(parsers):map(vim.treesitter.language.get_filetypes):flatten():totable(),
	callback = function(event)
		-- A parser can still be missing while the initial install runs.
		local parser = vim.treesitter.get_parser(event.buf)
		if not parser then
			return
		end

		vim.treesitter.start(event.buf)

		-- Upstream calls this experimental, and parsers that ship no `indents.scm`
		-- answer with column 0 rather than declining; taken as the price for a
		-- single indent path.
		vim.bo[event.buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"

		-- FileType fires again on `:edit`, so add only what is missing.
		local keys = vim.split(vim.bo[event.buf].indentkeys, ",", { trimempty = true })
		for _, key in ipairs(extra_indentkeys[parser:lang()] or {}) do
			if not vim.list_contains(keys, key) then
				table.insert(keys, key)
			end
		end

		vim.bo[event.buf].indentkeys = table.concat(keys, ",")
	end,
})
