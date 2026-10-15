-- VSCode-style snippets for the built-in completion menu.
-- Same places blink.cmp looked: `~/.config/nvim/snippets` and friendly-snippets.
-- Served as an in-process LSP so `vim.lsp.completion` can merge them with real servers.

local M = {}

local config_name = 'snippet-source'
local global_filetype = 'all'

local registry --- @type table<string, string[]>?
local items_cache = {} --- @type table<string, lsp.CompletionItem[]>

local function read_file(path)
	local ok, lines = pcall(vim.fn.readfile, path)
	if not ok then
		return nil
	end
	return table.concat(lines, '\n')
end

local function decode_json(path, text)
	local ok, decoded = pcall(vim.json.decode, text, { skip_comments = true })
	if not ok then
		vim.notify_once(('Failed to parse snippet file %s: %s'):format(path, decoded), vim.log.levels.ERROR)
		return nil
	end
	return decoded
end

local function search_paths()
	local paths = {}
	local seen = {}

	local function add(path)
		path = vim.fs.normalize(path)
		if seen[path] or vim.fn.isdirectory(path) == 0 then
			return
		end
		seen[path] = true
		paths[#paths + 1] = path
	end

	add(vim.fn.stdpath('config') .. '/snippets')
	for _, rtp in ipairs(vim.opt.runtimepath:get()) do
		if rtp:find('friendly%-snippets', 1, false) or rtp:find('friendly.snippets', 1, true) then
			add(rtp)
		end
	end

	return paths
end

--- @param root string
--- @return table<string, string[]>?
local function files_from_package(root)
	local path = vim.fs.joinpath(root, 'package.json')
	local text = read_file(path)
	if not text then
		return nil
	end

	local pkg = decode_json(path, text)
	local contributed = pkg and vim.tbl_get(pkg, 'contributes', 'snippets')
	if type(contributed) ~= 'table' then
		return nil
	end

	local files = {}
	for _, entry in ipairs(contributed) do
		local languages = entry.language
		if type(languages) == 'string' then
			languages = { languages }
		end
		if type(languages) == 'table' and type(entry.path) == 'string' then
			local snippet_path = vim.fs.normalize(vim.fs.joinpath(root, entry.path))
			for _, language in ipairs(languages) do
				files[language] = files[language] or {}
				files[language][#files[language] + 1] = snippet_path
			end
		end
	end

	return files
end

--- @param root string
--- @return table<string, string[]>
local function files_from_scan(root)
	local files = {}

	local function add(filetype, path)
		if filetype == '' or filetype == 'package' then
			return
		end
		files[filetype] = files[filetype] or {}
		files[filetype][#files[filetype] + 1] = path
	end

	for name, typ in vim.fs.dir(root) do
		local path = vim.fs.joinpath(root, name)
		if typ == 'file' and name:match('%.json$') and name ~= 'package.json' then
			add(name:gsub('%.json$', ''), path)
		elseif typ == 'directory' then
			for child, child_type in vim.fs.dir(path) do
				if child_type == 'file' and child:match('%.json$') then
					add(name, vim.fs.joinpath(path, child))
				end
			end
		end
	end

	return files
end

local function ensure_registry()
	if registry then
		return registry
	end

	registry = {}
	for _, root in ipairs(search_paths()) do
		local files = files_from_package(root) or files_from_scan(root)
		for filetype, paths in pairs(files) do
			registry[filetype] = vim.list_extend(registry[filetype] or {}, paths)
		end
	end

	return registry
end

function M.has_any()
	return next(ensure_registry()) ~= nil
end

--- @param filetype string
function M.has_for(filetype)
	local found = ensure_registry()
	return (found[filetype] and #found[filetype] > 0)
		or (filetype ~= global_filetype and found[global_filetype] and #found[global_filetype] > 0)
end

local function as_text(value)
	if type(value) == 'string' then
		return value
	end
	if type(value) == 'table' then
		return table.concat(value, '\n')
	end
	return ''
end

--- @param raw table
--- @param fallback string
--- @return { prefix: string, body: string, description: string }[]
local function snippet_defs(raw, fallback)
	local prefixes = raw.prefix or fallback
	if type(prefixes) == 'string' then
		prefixes = { prefixes }
	end
	if type(prefixes) ~= 'table' then
		return {}
	end

	local body = as_text(raw.body)
	if body == '' then
		return {}
	end

	local description = as_text(raw.description)
	if description == '' then
		description = fallback
	end

	local defs = {}
	for _, prefix in ipairs(prefixes) do
		if type(prefix) == 'string' and prefix ~= '' then
			defs[#defs + 1] = { prefix = prefix, body = body, description = description }
		end
	end
	return defs
end

--- @param filetype string
--- @return lsp.CompletionItem[]
local function items_for(filetype)
	local cached = items_cache[filetype]
	if cached then
		return cached
	end

	local found = ensure_registry()
	local files = {}
	vim.list_extend(files, found[filetype] or {})
	if filetype ~= global_filetype then
		vim.list_extend(files, found[global_filetype] or {})
	end

	local items = {}
	local seen = {}
	for _, path in ipairs(files) do
		local text = read_file(path)
		local decoded = text and decode_json(path, text)
		if type(decoded) == 'table' then
			for name, raw in pairs(decoded) do
				if type(raw) == 'table' and type(name) == 'string' then
					for _, def in ipairs(snippet_defs(raw, name)) do
						local key = def.prefix .. '\0' .. def.body
						if not seen[key] then
							seen[key] = true
							items[#items + 1] = {
								label = def.prefix,
								filterText = def.prefix,
								kind = vim.lsp.protocol.CompletionItemKind.Snippet,
								insertText = def.body,
								insertTextFormat = vim.lsp.protocol.InsertTextFormat.Snippet,
								documentation = {
									kind = vim.lsp.protocol.MarkupKind.Markdown,
									value = def.description,
								},
							}
						end
					end
				end
			end
		end
	end

	items_cache[filetype] = items
	return items
end

local function filetype_from_uri(uri)
	if type(uri) == 'string' then
		local bufnr = vim.fn.bufnr(vim.uri_to_fname(uri))
		if bufnr > 0 then
			return vim.bo[bufnr].filetype
		end
	end
	return vim.bo.filetype
end

local function cmd(dispatchers)
	local closing = false
	local request_id = 0
	local srv = {}

	function srv.request(method, params, callback)
		request_id = request_id + 1
		if method == 'initialize' then
			callback(nil, {
				capabilities = {
					-- Keyword completion is requested as Invoked, not as a fake trigger
					-- character. Real servers keep their own trigger characters.
					completionProvider = {
						triggerCharacters = {},
						resolveProvider = false,
					},
				},
			})
		elseif method == 'shutdown' then
			callback(nil, nil)
		elseif method == 'textDocument/completion' then
			local uri = vim.tbl_get(params or {}, 'textDocument', 'uri')
			callback(nil, {
				isIncomplete = false,
				items = items_for(filetype_from_uri(uri)),
			})
		else
			callback(nil, nil)
		end
		return true, request_id
	end

	function srv.notify(method)
		if method == 'exit' then
			dispatchers.on_exit(0, 15)
		end
		return false
	end

	function srv.is_closing()
		return closing
	end

	function srv.terminate()
		closing = true
	end

	return srv
end

function M.enable()
	vim.lsp.config(config_name, {
		cmd = cmd,
		root_dir = function(bufnr, on_dir)
			if vim.bo[bufnr].buftype == 'prompt' or vim.b[bufnr].completion == false then
				return
			end
			local filetype = vim.bo[bufnr].filetype
			if filetype == '' or not M.has_for(filetype) then
				return
			end
			on_dir(vim.fn.getcwd())
		end,
	})
	vim.lsp.enable(config_name)
end

return M
