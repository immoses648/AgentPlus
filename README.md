<div align="center">

<img src="docs/images/logo.png" width="88" alt="">

# AgentPlus

Manage API settings and model lists across your coding agents.

[![Release](https://img.shields.io/github/v/release/cnklpz/AgentPlus?color=2F54EB)](https://github.com/cnklpz/AgentPlus/releases/latest)
[![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?logo=windows&logoColor=white)](https://github.com/cnklpz/AgentPlus/releases/latest)
[![macOS](https://img.shields.io/badge/macOS-11%2B-000000?logo=apple&logoColor=white)](https://github.com/cnklpz/AgentPlus/releases/latest)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)

English | [简体中文](README.zh-CN.md)

</div>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/codex-dark-en.png">
  <img src="docs/images/codex-en.png" alt="AgentPlus main window">
</picture>

## Status and scope

**Active, pre-1.0.** AgentPlus is an independently maintained desktop configuration tool.
Plystra is a sponsor; AgentPlus keeps its own product identity, repository and license.
Windows 10/11 x64 is the primary platform. macOS 11+ on Apple silicon and Intel is
experimental; Linux packages are not supported. WSL support manages agent configuration
inside a distribution from the Windows app. The desktop interface requires a window of
at least 1100 x 700; mobile browsers are not a supported product surface.

AgentPlus is for people using their own coding agents and API providers. It does not host
models, provide API credits, replace the agents, or run a hosted account/sync service.
Protocol conversion cannot add capabilities, permissions or quota an upstream provider
does not offer. Support for an agent may need adjustment after that agent changes its
configuration or interface.

## Typical workflow

1. Add or import a provider in **Providers**, then choose the agents that should use it.
2. Choose models and edit the selected agent's **Pending changes**.
3. Review the diff and apply those agent changes. Changed configuration files are backed up.
4. Test the connection, restart the agent if it requires it, and use **History & rollback** to inspect
   or restore a supported backup when needed.

The write boundary matters: **saving the provider library writes immediately**. Adding
that provider to an agent queues a draft until you apply it. **Gateway settings and
forwarding changes take effect immediately**, including gateway resources created while
preparing an agent draft. Discarding a draft does not undo those library or gateway changes.
Sync imports follow the same split: library changes save immediately; agent changes become
drafts. See [data, network access and recovery](docs/data-and-network.md).

## Features

- **Provider library.** Put an API URL and key in once and every agent can use it. There are 21 templates for common providers and coding plans; most need nothing from you but a key.
- **Import links.** A relay's "Import to CC Switch" button (Sub2API, New API…) can fill in the add-provider dialog: paste its link under Providers → Import link, or let AgentPlus open `ccswitch://` links (Settings, Windows). See [Import links](#import-links).
- **Model lists.** Fetch what a provider offers, then choose what each agent shows.
- **Agent change preview.** Review pending agent changes before applying them; replaced configuration files are backed up under `~/.agentplus/backups/`.
- **Local gateway.** Converts between OpenAI Chat, OpenAI Responses and Anthropic Messages, streaming and tool calls included — which is how Claude Code can use a provider that only speaks OpenAI.
- **Connection tests.** Latency, plus a real request, so you know the URL, key and model work before you switch.
- **WSL.** Agents inside a WSL distro share the same provider library as Windows.
- **Privacy mode.** `Ctrl+Shift+H` hides keys, service URLs and usernames before a screenshot or a screen share.

Agents can also be restarted from the app. Then there's the command palette (`Ctrl+K`), a tray icon that keeps the gateway running after you close the window, in-app updates that check their own signature, and the interface in English or Chinese.

## Install

Download the latest build from [Releases](https://github.com/cnklpz/AgentPlus/releases/latest).

**Windows 10/11 (x64)** — `AgentPlus_<version>_x64-setup.exe`. The installer isn't code-signed yet, so SmartScreen may warn you on first launch; click *More info → Run anyway*.

**macOS 11+ (experimental)** — `_aarch64.dmg` for Apple silicon, `_x64.dmg` for Intel. The app isn't notarized, so allow it under *System Settings → Privacy & Security*. If macOS insists it's damaged:

```bash
xattr -cr /Applications/AgentPlus.app
```

Linux packages aren't available yet.

Updates are checked on startup and installed from *Settings → General → About*.

## Screenshots

<table>
  <tr>
    <td width="50%"><img src="docs/images/providers-en.png" alt="Provider library"></td>
    <td width="50%"><img src="docs/images/codex-models-en.png" alt="Model list"></td>
  </tr>
  <tr>
    <td align="center">The provider library, grouped by API service</td>
    <td align="center">Choosing which models Codex shows</td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/images/gateway-en.png" alt="Local gateway"></td>
  </tr>
  <tr>
    <td colspan="2" align="center">Gateway traffic, latency and failure rates</td>
  </tr>
</table>

## Supported agents

AgentPlus recognizes 15 agents and reads and writes the following config files:

| Agent | Config |
|---|---|
| Codex (desktop and CLI) | `~/.codex/config.toml`, `models.json` |
| Claude Code | `env` in `~/.claude/settings.json` |
| OpenCode | `~/.config/opencode/opencode.json(c)`, project-level `opencode.json` |
| MiMo Desktop | `~/.config/mimocode/mimocode.jsonc` |
| ZCode | `~/.zcode/v2/provider_config.json` |
| Gemini CLI | `~/.gemini/settings.json` |
| Qwen Code | `~/.qwen/settings.json` |
| Kimi Code | `~/.kimi-code/config.toml` |
| Kilo Code | `~/.config/kilo/kilo.json(c)` |
| CodeBuddy | `~/.codebuddy/models.json` |
| Droid (Factory) | `~/.factory/settings.json` |
| Hermes | `$HERMES_HOME/config.yaml` |
| pi | `~/.pi/agent/models.json` |
| OpenClaw | `~/.openclaw/openclaw.json` |
| Trae | Detection only. Custom models live in your account; AgentPlus walks you through adding them by hand |

Only the agents it finds show up in the app. If yours is installed somewhere unusual, point AgentPlus at the folder in *Settings → Agent detection*.

<details>
<summary><b>Codex</b></summary>

- Use a fixed provider ID so past sessions stay visible when you switch API services.
- Save a model list per provider; switching loads it automatically.
- Browse sessions and see why one is hidden. Move a session to another provider (undoable), or copy its `codex resume` command.
- Checks the database, missing files and oversized logs, and backs up before cleaning up.
- Import the official model catalog once you've signed in with ChatGPT.
- Experimental, unofficial desktop UI patches: Fast visibility, model names and usage-related UI. These depend on Codex internals; see [scope and how to turn them off](docs/architecture.md#experimental-codex-ui-patches).

</details>

<details>
<summary><b>Claude Code</b></summary>

- Save a profile per provider; switching writes it into the `env` block of `settings.json`. Configs you wrote by hand can be imported too.
- Set the default model, and which models Opus, Sonnet, Haiku and subagents use.
- APIs on other protocols go through the local gateway, which converts to and from the Anthropic protocol Claude Code expects.
- Turn off nonessential traffic and the Co-Authored-By line in Git commits.

</details>

<details>
<summary><b>OpenCode and Kilo Code</b></summary>

- Manage project-level configs, and see which settings come from the global config.
- Edit the common settings in a form: default model, `small_model`, enabled providers, sharing, auto-update, permissions.
- Providers you logged in with `opencode auth` show up read-only.

</details>

<details>
<summary><b>ZCode and MiMo Desktop</b></summary>

- ZCode: model order, per-model context rules, reasoning display, memory, tray.
- MiMo Desktop: the models built into your account, skill folders, tray behavior, voice feedback.
- Restart either app from AgentPlus.

</details>

<details>
<summary><b>Other agents</b></summary>

- Gemini CLI: switch between profiles. If environment variables or a project's `.env` override the settings, you get a warning.
- Kimi Code and Hermes: only the blocks that changed are rewritten, comments and formatting left intact.
- CodeBuddy: one config for the IDE and the CLI, hot-reloaded within a second.
- Droid: the config is re-read before writing, so edits made while Droid is running aren't lost.
- OpenClaw: change a URL or key and the model files it generates per agent are updated too.
- pi: written in the formats pi supports, so an invalid field can't make the file unreadable.
- Variable references (`$VAR`, `${VAR}`, `env_key`) are left alone.

</details>

## Import links

AgentPlus opens `agentplus://v1/import?…` links, which take the same query parameters as CC Switch's `ccswitch://v1/import?…` provider links: a site that already has an "Import to CC Switch" button only needs to swap the scheme.

```text
agentplus://v1/import?resource=provider&app=claude&name=My%20Relay&endpoint=https%3A%2F%2Frelay.example.com&apiKey=sk-...&model=claude-sonnet-5
```

- `app`: `claude` (Anthropic), `codex` (OpenAI Responses; include `/v1` in `endpoint`), `gemini`, `opencode`, `openclaw`, `hermes`; anything else is added as an OpenAI Chat-compatible provider. The agent named is ticked in the dialog.
- `name`, `endpoint` (the first of a comma-separated list), `apiKey`, `homepage`, and `model` / `sonnetModel` / `opusModel` / `haikuModel` for the model list. CC Switch's base64 `config` is read too; `usage*` parameters are ignored.
- `agentplus://` links may also set `api` (`responses`, `chat`, `anthropic`, `gemini`) and `models` (comma-separated).

A link fills in the dialog; nothing is saved until you click Add. A link can contain an API
key, so treat it as a secret and check the destination before fetching models or testing it.

## Building from source

AgentPlus is built on [Tauri 2](https://tauri.app): React and TypeScript in `src/`, Rust in `src-tauri/`. You'll need Node.js 18+, the current stable Rust toolchain and the [Tauri prerequisites](https://tauri.app/start/prerequisites/).

Install dependencies and start the development app:

```bash
npm ci
npm run tauri dev
```

Build and run checks:

```bash
npm run tauri build    # Build the installer
npm run check          # Frontend type checks and tests
cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
```

To preview the interface in a browser with demo data, run `npm run dev`.

See the [architecture](docs/architecture.md), [development and release guide](docs/development-and-release.md)
and [contribution guide](CONTRIBUTING.md) for current workflows. The old
[design draft](docs/design.html) is historical and includes features that did not ship.

## Data and support

Provider keys and configuration backups can be stored in plain text on this computer.
Privacy mode masks the interface; it does not encrypt files or the clipboard. Sync-file
encryption is optional and separate from local key storage. AgentPlus also makes network
requests for updates, model metadata, latency checks and the providers you use. Read the
[data and network guide](docs/data-and-network.md) before sharing files or enabling sync.

Report reproducible bugs and scoped feature requests through
[GitHub Issues](https://github.com/cnklpz/AgentPlus/issues). Include the AgentPlus version,
OS, affected agent version and redacted reproduction steps. Maintenance is best effort;
there is no guaranteed response time. Use the [security reporting instructions](SECURITY.md)
for vulnerabilities, without posting keys, configuration files or exploit details publicly.

## License

[AGPL-3.0-only](LICENSE). Copyright (C) 2026 cnklpz.

For uses outside the AGPL's terms, such as closed-source distribution, contact the author for a commercial license.
