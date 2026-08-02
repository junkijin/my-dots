vim.loader.enable()

-- Must precede every `<leader>` mapping, including the ones plugins define.
vim.g.mapleader = " "

require("config.options")
require("config.keymaps")
require("config.pack")

-- Plugins are on 'runtimepath' from here on, so `plugin/*.lua` (sourced right
-- after this file) can configure them directly.
vim.cmd.colorscheme("junki")
