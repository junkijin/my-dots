vim.api.nvim_create_autocmd("FileType", {
	callback = function(args)
		vim.bo[args.buf].indentexpr = ""

		local ok = pcall(vim.treesitter.start, args.buf)
		if ok then
			vim.bo[args.buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
		end
	end,
})
