vim.api.nvim_create_autocmd('PackChanged', {
	callback = function(ev)
		local name, kind = ev.data.spec.name, ev.data.kind
		if name == 'nvim-treesitter' and (kind == 'install' or kind == 'update') then
			if not ev.data.active then
				vim.cmd.packadd('nvim-treesitter')
			end
			vim.cmd('TSUpdate')
		end
	end,
})
vim.pack.add({ "https://github.com/nvim-treesitter/nvim-treesitter" }, { confirm = false })

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
	"zig",
}

require('nvim-treesitter').install(parsers)

vim.api.nvim_create_autocmd('FileType', {
	pattern = vim.iter(parsers):map(vim.treesitter.language.get_filetypes):flatten():totable(),
	callback = function() vim.treesitter.start() end,
})

vim.wo[0][0].foldexpr = 'v:lua.vim.treesitter.foldexpr()'
vim.wo[0][0].foldmethod = 'expr'

vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
