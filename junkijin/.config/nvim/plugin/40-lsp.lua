vim.diagnostic.config({
	signs = false,
})

local ignored_lsp_progress_clients = {
	["null-ls"] = true,
}

local native_lsp_progress_group = vim.api.nvim_create_augroup("NativeLspProgress", { clear = true })

vim.api.nvim_create_autocmd("LspProgress", {
	group = native_lsp_progress_group,
	callback = function(event)
		local data = event.data or {}
		local client = data.client_id and vim.lsp.get_client_by_id(data.client_id)
		if not client or ignored_lsp_progress_clients[client.name] then
			return
		end

		local params = data.params or {}
		local value = params.value
		if type(value) ~= "table" or type(value.kind) ~= "string" then
			return
		end

		local message = value.message
		if not message or message == "" then
			message = value.kind == "end" and "" or ""
		end

		local title = client.name
		if value.title and value.title ~= "" then
			title = ("%s: %s"):format(client.name, value.title)
		end

		vim.api.nvim_echo({ { message } }, false, {
			id = ("vim.lsp.%d.%s"):format(data.client_id, tostring(params.token)),
			kind = "progress",
			source = "vim.lsp",
			title = title,
			status = value.kind == "end" and "success" or "running",
			percent = value.kind == "end" and 100 or value.percentage,
			data = {
				client_id = data.client_id,
				params = params,
			},
		})
	end,
})
