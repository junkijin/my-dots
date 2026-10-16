return {
	cmd = function(dispatchers, config)
		local dir = (config or {}).root_dir
		while dir do
			local bin = vim.fs.joinpath(dir, "node_modules/.bin/oxlint")
			if vim.fn.executable(bin) == 1 then
				return vim.lsp.rpc.start({ bin, "--lsp" }, dispatchers)
			end
			local parent = vim.fs.dirname(dir)
			if parent == dir then
				break
			end
			dir = parent
		end
		return vim.lsp.rpc.start({ "oxlint", "--lsp" }, dispatchers)
	end,
}
