local ignored_filetypes = {
	gitcommit = true,
	gitrebase = true,
	hgcommit = true,
	svn = true,
	xxd = true,
}

local ignored_buftypes = {
	help = true,
	nofile = true,
	quickfix = true,
}

local function restore_cursor(buf, win)
	if not vim.api.nvim_buf_is_valid(buf) or not vim.api.nvim_buf_is_loaded(buf) then
		return
	end

	if not vim.api.nvim_win_is_valid(win) or vim.api.nvim_win_get_buf(win) ~= buf then
		return
	end

	if ignored_buftypes[vim.bo[buf].buftype] or ignored_filetypes[vim.bo[buf].filetype] then
		return
	end

	if vim.wo[win].diff then
		return
	end

	local file = vim.api.nvim_buf_get_name(buf)
	if file == "" or vim.fn.filereadable(file) == 0 then
		return
	end

	local mark = vim.api.nvim_buf_get_mark(buf, '"')
	local line = mark[1]
	local column = mark[2]
	local line_count = vim.api.nvim_buf_line_count(buf)

	if line < 1 or line > line_count then
		return
	end

	local current_line = vim.api.nvim_buf_get_lines(buf, line - 1, line, true)[1] or ""
	column = math.min(column, #current_line)

	if pcall(vim.api.nvim_win_set_cursor, win, { line, column }) then
		vim.api.nvim_win_call(win, function()
			vim.cmd("normal! zvzz")
		end)
	end
end

vim.api.nvim_create_autocmd("BufReadPost", {
	group = vim.api.nvim_create_augroup("RestoreCursor", { clear = true }),
	callback = function(event)
		local win = vim.api.nvim_get_current_win()

		vim.schedule(function()
			restore_cursor(event.buf, win)
		end)
	end,
})
