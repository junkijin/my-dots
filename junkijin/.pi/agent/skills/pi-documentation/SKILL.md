---
name: pi-documentation
description: Ground Pi coding-agent (`pi`) work in the active installation's bundled docs. Use for Pi SDKs, extensions/custom tools, themes, skills/prompt templates, TUI/keybindings, providers/models, packages, settings, and environment variables; not generic agent/CLI work, tasks merely run in Pi, unrelated “pi” names, Raspberry Pi, or mathematics.
---

# Pi Documentation

Use the active Pi installation's bundled documentation as the source of truth.

- Find its package root from a valid `PI_PACKAGE_DIR`, or by tracing `command -v pi` through symlinks, launcher scripts, and package-manager layout. Accept only a root containing `README.md`, `docs/`, and `examples/`; never substitute paths under the working directory. If none is found, report the blocker.
- Read the relevant Markdown files to EOF before answering. For changes, also inspect relevant examples and follow necessary cross-references. Resolve every read under the validated package root.
- Route general usage to `README.md`; named features to the matching `docs/<topic>.md`; extensions and custom tools to `docs/extensions.md` plus `examples/extensions/`; SDK work to `docs/sdk.md` plus `examples/sdk/`; providers to `docs/custom-provider.md`.
- Report missing or conflicting evidence instead of guessing.
