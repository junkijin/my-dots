local treesitter_parsers = {
	"bash",
	"comment",
	"css",
	"diff",
	"dtd",
	"editorconfig",
	"fish",
	"git_config",
	"git_rebase",
	"gitattributes",
	"gitcommit",
	"gitignore",
	"graphql",
	"go",
	"gomod",
	"gosum",
	"html",
	"javascript",
	"jsdoc",
	"json",
	"latex",
	"lua",
	"markdown",
	"markdown_inline",
	"ruby",
	"scss",
	"styled",
	"toml",
	"tsx",
	"typescript",
	"typst",
	"vim",
	"vimdoc",
	"xml",
	"yaml",
	"zig",
}

local function wait_for_task(task)
	if task ~= nil and type(task.wait) == "function" then
		task:wait(300000)
	end
end

local function sync_treesitter_parsers(kind)
	local ok, treesitter = pcall(require, "nvim-treesitter")
	if not ok then
		vim.notify("Failed to load nvim-treesitter: " .. treesitter, vim.log.levels.ERROR)
		return
	end

	if kind == "install" then
		wait_for_task(treesitter.install(treesitter_parsers, { summary = true }))
	elseif kind == "update" then
		wait_for_task(treesitter.install(treesitter_parsers, { summary = true }))
		wait_for_task(treesitter.update(treesitter_parsers, { summary = true }))
	end
end

vim.api.nvim_create_autocmd("PackChanged", {
	group = vim.api.nvim_create_augroup("my.pack", { clear = true }),
	callback = function(event)
		local data = event.data or {}
		local spec = data.spec or {}
		local name = spec.name
		local kind = data.kind

		if name ~= "nvim-treesitter" or (kind ~= "install" and kind ~= "update") then
			return
		end

		if not data.active then
			pcall(vim.cmd.packadd, "nvim-treesitter")
		end

		local ok, err = pcall(sync_treesitter_parsers, kind)
		if not ok then
			vim.notify("Failed to sync Treesitter parsers: " .. err, vim.log.levels.ERROR)
		end
	end,
})

vim.pack.add({
	{ src = "https://github.com/nvim-treesitter/nvim-treesitter", version = "main" },
}, {
	load = true,
	confirm = false,
})
