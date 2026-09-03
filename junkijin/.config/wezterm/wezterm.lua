local wezterm = require("wezterm")
local act = wezterm.action

local color_scheme = "Gruvbox Dark (Gogh)"
local colors = wezterm.color.get_builtin_schemes()[color_scheme]

local function is_vim(pane)
	return pane:get_user_vars().IS_NVIM == "true"
end

local direction_keys = {
	h = "Left",
	j = "Down",
	k = "Up",
	l = "Right",
}

local function split_nav(mode, key)
	local mods = mode == "resize" and "META" or "CTRL"

	return {
		key = key,
		mods = mods,
		action = wezterm.action_callback(function(window, pane)
			if is_vim(pane) then
				window:perform_action({ SendKey = { key = key, mods = mods } }, pane)
			elseif mode == "resize" then
				window:perform_action({ AdjustPaneSize = { direction_keys[key], 3 } }, pane)
			else
				window:perform_action({ ActivatePaneDirection = direction_keys[key] }, pane)
			end
		end),
	}
end

wezterm.on("format-tab-title", function()
	return ""
end)

wezterm.on("update-status", function(window, _pane)
	local tabs = {}
	for _, t in ipairs(window:mux_window():tabs_with_info()) do
		if t.is_active then
			table.insert(tabs, { Background = { Color = colors.background } })
			table.insert(tabs, { Foreground = { Color = colors.foreground } })
		else
			table.insert(tabs, { Background = { Color = "#1d2021" } })
			table.insert(tabs, { Foreground = { Color = "#7c6f64" } })
		end
		table.insert(tabs, { Text = " " .. (t.index + 1) .. " " })
	end
	table.insert(tabs, { Background = { Color = "#1d2021" } })
	table.insert(tabs, { Text = "  " })
	window:set_right_status(wezterm.format(tabs))
end)

return {
	-- shell
	default_prog = { "/opt/homebrew/bin/fish", "-l" },
	scrollback_lines = 100000,

	-- window
	initial_cols = 120,
	initial_rows = 29,
	use_resize_increments = false,
	window_content_alignment = {
		horizontal = "Center",
		vertical = "Center",
	},
	window_padding = {
		left = 2,
		right = 2,
		top = 2,
		bottom = 2,
	},

	-- tab bar
	enable_tab_bar = true,
	use_fancy_tab_bar = false,
	tab_bar_at_bottom = true,
	tab_bar_style = {
		new_tab = "",
		new_tab_hover = "",
	},

	-- macOS
	use_resize_increments = true,
	send_composed_key_when_left_alt_is_pressed = false,
	send_composed_key_when_right_alt_is_pressed = false,

	-- typography
	freetype_load_target = "Light",
	font_size = 14.0,
	font = wezterm.font("JetBrainsMono Nerd Font"),
	line_height = 1.15,
	cell_width = 0.95,
	foreground_text_hsb = {
		saturation = 1.05,
		brightness = 1.05,
	},

	-- theme
	color_scheme = color_scheme,
	colors = { tab_bar = { background = "#1d2021" } },

	-- shortcuts
	disable_default_key_bindings = true,
	keys = {
		{ key = "q", mods = "CMD", action = act.QuitApplication },
		{ key = "n", mods = "CMD", action = act.SpawnWindow },
		{ key = "c", mods = "CMD", action = act.CopyTo("Clipboard") },
		{ key = "v", mods = "CMD", action = act.PasteFrom("Clipboard") },
		{ key = "d", mods = "CMD", action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }) },
		{ key = "d", mods = "CMD|SHIFT", action = act.SplitVertical({ domain = "CurrentPaneDomain" }) },
		{ key = "t", mods = "CMD", action = act.SpawnTab("CurrentPaneDomain") },
		{ key = "1", mods = "CMD", action = act.ActivateTab(0) },
		{ key = "2", mods = "CMD", action = act.ActivateTab(1) },
		{ key = "3", mods = "CMD", action = act.ActivateTab(2) },
		{ key = "4", mods = "CMD", action = act.ActivateTab(3) },
		{ key = "5", mods = "CMD", action = act.ActivateTab(4) },
		{ key = "6", mods = "CMD", action = act.ActivateTab(5) },
		{ key = "7", mods = "CMD", action = act.ActivateTab(6) },
		{ key = "8", mods = "CMD", action = act.ActivateTab(7) },
		{ key = "9", mods = "CMD", action = act.ActivateTab(8) },
		{ key = "0", mods = "CMD", action = act.ActivateTab(9) },
		{ key = "{", mods = "CMD|SHIFT", action = act.ActivateTabRelative(-1) },
		{ key = "}", mods = "CMD|SHIFT", action = act.ActivateTabRelative(1) },
		{ key = ",", mods = "CMD|SHIFT", action = act.ReloadConfiguration },

		-- smart-splits.nvim: move between Neovim and WezTerm panes
		split_nav("move", "h"),
		split_nav("move", "j"),
		split_nav("move", "k"),
		split_nav("move", "l"),

		-- smart-splits.nvim: resize Neovim or WezTerm panes
		split_nav("resize", "h"),
		split_nav("resize", "j"),
		split_nav("resize", "k"),
		split_nav("resize", "l"),
	},
}
