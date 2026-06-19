local indent_char = "│"

local function update_listchars()
	local tabstop = vim.bo.tabstop

	vim.opt_local.list = true
	vim.opt_local.listchars = {
		tab = indent_char .. " ",
		leadmultispace = indent_char .. string.rep(" ", math.max(tabstop - 1, 0)),
		trail = "·",
		nbsp = "␣",
	}
end

update_listchars()

vim.api.nvim_create_autocmd({ "BufEnter", "OptionSet" }, {
	group = vim.api.nvim_create_augroup("listchars_indent_guides", { clear = true }),
	callback = function(event)
		if event.event == "OptionSet" and event.match ~= "tabstop" then
			return
		end

		update_listchars()
	end,
})
