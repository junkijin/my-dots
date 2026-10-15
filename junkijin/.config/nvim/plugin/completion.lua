-- Built-in replacement for the blink.cmp setup this used:
-- lsp + snippets, default keymap, no auto-insert, no auto-brackets.
-- LSP snippet items still expand through vim.lsp.completion on <C-y>.

local snippets = require('my.snippets')

-- 'autocomplete' also completes buffer words from 'complete'. Leave it off.
-- noselect keeps the menu from inserting or showing docs until an item is
-- selected; <C-y> still accepts the first item, like blink's select_and_accept.
vim.opt.autocomplete = false
vim.opt.completeopt:append({ 'menuone', 'noselect', 'noinsert', 'fuzzy' })

local completion_group = vim.api.nvim_create_augroup('MyLspCompletion', { clear = true })
local keyword_timer --- @type uv.uv_timer_t?

-- kind column only. Candidate text stays Pmenu. Colors come from the active scheme.
local kind_source = {
	Text = 'String',
	Method = 'Function',
	Function = 'Function',
	Constructor = '@constructor',
	Field = '@variable.member',
	Variable = 'Identifier',
	Class = 'Type',
	Interface = 'Type',
	Module = '@module',
	Property = '@property',
	Unit = 'Number',
	Value = 'Constant',
	Enum = 'Type',
	Keyword = 'Keyword',
	Snippet = 'Special',
	File = 'Directory',
	Reference = 'Identifier',
	Folder = 'Directory',
	EnumMember = 'Constant',
	Constant = 'Constant',
	Struct = 'Type',
	Event = 'Special',
	Operator = 'Operator',
	TypeParameter = 'Type',
}

local kind_hlgroup = {}

local function apply_kind_highlights()
	for name, source in pairs(kind_source) do
		local group = 'ComplKind' .. name
		local fg = vim.api.nvim_get_hl(0, { name = source, link = false }).fg
		if fg then
			kind_hlgroup[name] = group
			vim.api.nvim_set_hl(0, group, { fg = fg })
		else
			kind_hlgroup[name] = nil
		end
	end
end

apply_kind_highlights()

vim.api.nvim_create_autocmd('ColorScheme', {
	group = completion_group,
	callback = apply_kind_highlights,
})

local function convert(item)
	-- Color items already get a swatch highlight from vim.lsp.completion.
	if item.kind == vim.lsp.protocol.CompletionItemKind.Color then
		return {}
	end
	local name = vim.lsp.protocol.CompletionItemKind[item.kind]
	local group = name and kind_hlgroup[name]
	if not group then
		return {}
	end
	return { kind_hlgroup = group }
end

local function close_timer(timer)
	if timer and not timer:is_closing() then
		timer:stop()
		timer:close()
	end
end

local function request_keyword_completion()
	close_timer(keyword_timer)
	local timer = assert(vim.uv.new_timer())
	keyword_timer = timer
	timer:start(
		25,
		0,
		vim.schedule_wrap(function()
			if keyword_timer == timer then
				keyword_timer = nil
			end
			close_timer(timer)
			-- Menu already open: built-in completion filters the current list.
			if vim.fn.mode():sub(1, 1) ~= 'i' or vim.fn.pumvisible() == 1 then
				return
			end
			vim.lsp.completion.get()
		end)
	)
end

local function pum_visible()
	return vim.fn.pumvisible() == 1
end

local function preview_winid()
	local winid = vim.fn.complete_info({ 'preview_winid' }).preview_winid
	if type(winid) == 'number' and winid > 0 and vim.api.nvim_win_is_valid(winid) then
		return winid
	end
end

-- blink default: <C-n>/<C-p> select without inserting, and do not fall through
-- to built-in keyword completion when the menu is closed.
vim.keymap.set('i', '<C-n>', function()
	if pum_visible() then
		return '<Down>'
	end
	return ''
end, { expr = true, silent = true, desc = 'Select next completion' })

vim.keymap.set('i', '<C-p>', function()
	if pum_visible() then
		return '<Up>'
	end
	return ''
end, { expr = true, silent = true, desc = 'Select previous completion' })

-- blink default <C-y> is select_and_accept: accept the selection, or the first
-- item when nothing is selected.
vim.keymap.set('i', '<C-y>', function()
	if not pum_visible() then
		return '<C-y>'
	end
	if vim.fn.complete_info({ 'selected' }).selected == -1 then
		return '<Down><C-y>'
	end
	return '<C-y>'
end, { expr = true, silent = true, desc = 'Accept completion' })

vim.keymap.set('i', '<C-Space>', function()
	if not pum_visible() then
		vim.lsp.completion.get()
		return
	end

	local winid = preview_winid()
	if winid then
		vim.api.nvim_win_hide(winid)
		return
	end

	if vim.fn.complete_info({ 'selected' }).selected == -1 then
		vim.api.nvim_feedkeys(vim.keycode('<Down>'), 'n', false)
	end
end, { silent = true, desc = 'Show completion or hide documentation' })

local function scroll_preview(delta)
	local winid = preview_winid()
	if not winid then
		return false
	end
	vim.api.nvim_win_call(winid, function()
		local view = vim.fn.winsaveview()
		view.topline = math.max(1, view.topline + delta)
		vim.fn.winrestview(view)
	end)
	return true
end

vim.keymap.set('i', '<C-b>', function()
	if scroll_preview(-4) then
		return ''
	end
	return '<C-b>'
end, { expr = true, silent = true, desc = 'Scroll completion documentation up' })

vim.keymap.set('i', '<C-f>', function()
	if scroll_preview(4) then
		return ''
	end
	return '<C-f>'
end, { expr = true, silent = true, desc = 'Scroll completion documentation down' })

vim.keymap.set({ 'i', 's' }, '<Esc>', function()
	vim.snippet.stop()
	return '<Esc>'
end, { expr = true, silent = true, desc = 'Stop snippet' })

-- blink had documentation treesitter highlighting disabled.
vim.api.nvim_create_autocmd('CompleteChanged', {
	group = vim.api.nvim_create_augroup('MyCompletionDocs', { clear = true }),
	callback = function()
		local bufnr = vim.fn.complete_info({ 'preview_bufnr' }).preview_bufnr
		if type(bufnr) ~= 'number' or bufnr <= 0 or bufnr == vim.api.nvim_get_current_buf() then
			return
		end
		vim.schedule(function()
			if vim.api.nvim_buf_is_valid(bufnr) and bufnr ~= vim.api.nvim_get_current_buf() then
				vim.treesitter.stop(bufnr)
			end
		end)
	end,
})

vim.api.nvim_create_autocmd('LspAttach', {
	group = completion_group,
	callback = function(ev)
		if vim.bo[ev.buf].buftype == 'prompt' or vim.b[ev.buf].completion == false then
			return
		end

		local client = vim.lsp.get_client_by_id(ev.data.client_id)
		if not client or not client:supports_method('textDocument/completion', ev.buf) then
			return
		end

		-- autotrigger covers the server's own trigger characters (`.`, `:`, ...).
		-- Identifier characters are requested below as Invoked, which is what
		-- servers expect for ordinary typing.
		vim.lsp.completion.enable(true, client.id, ev.buf, {
			autotrigger = true,
			convert = convert,
		})
	end,
})

vim.api.nvim_create_autocmd('InsertCharPre', {
	group = completion_group,
	callback = function()
		if vim.bo.buftype == 'prompt' or vim.b.completion == false then
			return
		end
		local char = vim.v.char
		if type(char) ~= 'string' or not char:match('^[%w_%-]$') then
			return
		end
		request_keyword_completion()
	end,
})

vim.api.nvim_create_autocmd('InsertLeave', {
	group = completion_group,
	callback = function()
		close_timer(keyword_timer)
		keyword_timer = nil
	end,
})

if snippets.has_any() then
	snippets.enable()
end
