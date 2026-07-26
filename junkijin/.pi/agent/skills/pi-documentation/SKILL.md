---
name: pi-documentation
description: Use this skill whenever the user asks about the Pi coding agent itself or wants to configure, extend, or integrate with Pi, including its SDK, extensions, custom tools, themes, skills, prompt templates, TUI components, keybindings, custom providers, models, packages, or environment variables. Do not use it for unrelated coding tasks or other meanings of “pi.”
---

# Pi Documentation

Consult the documentation bundled with the active Pi installation before answering or implementing Pi-specific work.

## Locate the documentation

Determine the active Pi package root at runtime. Never hard-code an OS-, user-, version-, package-scope-, or package-manager-specific path.

1. If `PI_PACKAGE_DIR` is set, resolve it and use it only if it passes the validation below.
2. Otherwise, resolve the active `pi` launcher from `PATH`. Pi requires Bash on Windows too, so `command -v pi` is available on supported Windows setups. Follow symlinks and inspect launcher scripts until reaching the actual Pi executable or Node entrypoint.
3. For a standalone binary, check the executable's directory. For an npm-style install or source checkout, walk upward from the resolved entrypoint to the package root containing its `package.json`.
4. If the launcher cannot identify the root, query the package manager that installed Pi and inspect its global package location: npm (`npm root -g`), pnpm (`pnpm root -g`), Yarn (`yarn global dir`), Bun (`bun pm bin -g` and its global `node_modules`), or Homebrew (`brew --prefix pi-coding-agent`). Do not assume a particular package scope or package name; identify the package by its `pi` executable metadata and bundled assets.
5. Accept a candidate only when it contains all three: `README.md`, `docs/`, and `examples/`. If no candidate passes, report that the bundled Pi documentation could not be located rather than resolving paths beneath the current working directory.

From the validated package root:

- Main documentation: `README.md`
- Additional documentation: `docs/`
- Examples: `examples/` (extensions, custom tools, and SDK)

Resolve these to absolute native paths before reading them. Resolve `docs/...` beneath the Additional documentation root and `examples/...` beneath the Examples root, never beneath the current working directory.

## Topic routing

- Pi itself or general usage: `README.md`
- Extensions and custom tools: `docs/extensions.md` and `examples/extensions/`
- Themes: `docs/themes.md`
- Skills: `docs/skills.md`
- Prompt templates: `docs/prompt-templates.md`
- TUI components: `docs/tui.md`
- Keybindings: `docs/keybindings.md`
- SDK integrations: `docs/sdk.md` and `examples/sdk/`
- Custom providers: `docs/custom-provider.md` and relevant examples under `examples/extensions/`
- Adding models: `docs/models.md`
- Pi packages: `docs/packages.md`
- Environment variables: `docs/environment-variables.md`

## Reading workflow

1. Read the relevant bundled documentation and examples before answering. Before implementing Pi-related work, inspect both the relevant docs and examples.
2. Read every selected Pi Markdown file completely. If tool output is truncated, continue reading with offsets until EOF.
3. Follow relevant Markdown cross-references before implementing. Resolve linked `docs/...` and `examples/...` paths against the roots above; for example, read `docs/tui.md` when an extension task depends on TUI API details.
4. Treat the bundled documentation and examples for the active installation as the source of truth rather than relying on memory.
