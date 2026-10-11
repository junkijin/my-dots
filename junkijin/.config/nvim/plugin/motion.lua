vim.pack.add({
	"https://codeberg.org/andyg/leap.nvim",
	"https://github.com/haya14busa/vim-asterisk",
}, { confirm = false })

vim.keymap.set({ "n", "x", "o" }, "s", "<Plug>(leap)")
vim.keymap.set("n", "S", "<Plug>(leap-from-window)")

require("leap.user").set_repeat_keys("<enter>", "<backspace>")

vim.keymap.set("n", "*", "<Plug>(asterisk-z*)")
vim.keymap.set("n", "#", "<Plug>(asterisk-z#)")
vim.keymap.set("n", "g*", "<Plug>(asterisk-gz*)")
vim.keymap.set("n", "g#", "<Plug>(asterisk-gz#)")
