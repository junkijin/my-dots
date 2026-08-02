-- Base configs come from nvim-lspconfig's `lsp/`; per-server overrides live in
-- `after/lsp/` so they are merged last (:h lsp-config).
vim.lsp.enable({
	"elixirls",
	"eslint",
	"tailwindcss",
	"vtsls",
	"zls",
})
