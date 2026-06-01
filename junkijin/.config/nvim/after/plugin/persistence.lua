vim.keymap.set("n", "<leader>qs", "<cmd>lua require('persistence').load()<cr>")
vim.keymap.set("n", "<leader>qS", "<cmd>lua require('persistence').select()<cr>")
vim.keymap.set("n", "<leader>ql", "<cmd>lua require('persistence').load({ last = true })<cr>")
vim.keymap.set("n", "<leader>qd", "<cmd>lua require('persistence').stop()<cr>")

require("persistence").setup({})
