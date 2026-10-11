vim.pack.add({
  {
    src = "https://github.com/smart-splits-nvim/smart-splits.nvim",
    version = vim.version.range("3"),
  },
  "https://github.com/smart-splits-nvim/backend-ghostty",
}, { confirm = false })

-- The backend must be configured before smart-splits selects it.
require("smart-splits-backend-ghostty").setup({})
require("smart-splits").setup({
  mux = { backend = "smart-splits-backend-ghostty" },
  move = { at_edge = "stop" },
})

local splits = require("smart-splits")

vim.keymap.set("n", "<A-h>", splits.resize_left)
vim.keymap.set("n", "<A-j>", splits.resize_down)
vim.keymap.set("n", "<A-k>", splits.resize_up)
vim.keymap.set("n", "<A-l>", splits.resize_right)
vim.keymap.set("n", "<C-h>", splits.move_cursor_left)
vim.keymap.set("n", "<C-j>", splits.move_cursor_down)
vim.keymap.set("n", "<C-k>", splits.move_cursor_up)
vim.keymap.set("n", "<C-l>", splits.move_cursor_right)
vim.keymap.set("n", "<leader><leader>h", splits.swap_buf_left)
vim.keymap.set("n", "<leader><leader>j", splits.swap_buf_down)
vim.keymap.set("n", "<leader><leader>k", splits.swap_buf_up)
vim.keymap.set("n", "<leader><leader>l", splits.swap_buf_right)
