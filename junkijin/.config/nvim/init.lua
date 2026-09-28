vim.loader.enable()

-- Must precede every `<leader>` mapping, including the ones plugins define.
vim.g.mapleader = " "

require("my.options")
require("my.keymaps")

-- Each `plugin/*.lua` installs and configures the plugins it uses. Those
-- scripts run after this file, where `vim.pack.add()` loads plugins on the spot
-- (`load` defaults to `true` once init.lua is done, :h vim.pack.add()).
--
-- Keep every `src` identical to `nvim-pack-lock.json`: on mismatch `vim.pack`
-- deletes the plugin and reinstalls it from the new source.
--
-- `PackChanged` hooks that must see `install` events go here: the first
-- `vim.pack.add()` also installs whatever the lockfile lists (:h vim.pack-events).
