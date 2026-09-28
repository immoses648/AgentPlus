<div align="center">

<img src="docs/images/logo.png" width="88" alt="">

# AgentPlus

统一管理编程 Agent 的 API 配置和模型列表。

[![Release](https://img.shields.io/github/v/release/cnklpz/AgentPlus?color=2F54EB)](https://github.com/cnklpz/AgentPlus/releases/latest)
[![Windows](https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?logo=windows&logoColor=white)](https://github.com/cnklpz/AgentPlus/releases/latest)
[![macOS](https://img.shields.io/badge/macOS-11%2B-000000?logo=apple&logoColor=white)](https://github.com/cnklpz/AgentPlus/releases/latest)
[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![License](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)

[English](README.md) | 简体中文

</div>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/codex-dark-zh.png">
  <img src="docs/images/codex-zh.png" alt="AgentPlus 主界面">
</picture>

## 状态与范围

**Active（持续开发维护），尚未到 1.0。** AgentPlus 是独立维护的桌面配置工具。
Plystra 是赞助商；AgentPlus 保留自己的产品身份、仓库和许可证。
Windows 10/11 x64 是主要平台；macOS 11+ 的 Apple 芯片与 Intel 版本为实验性支持，
不支持 Linux 安装包。WSL 功能由 Windows 应用管理发行版内的 Agent 配置。
桌面界面要求至少 1100 x 700 的窗口；移动端浏览器不属于支持范围。

AgentPlus 面向已经在使用编程 Agent 和 API 服务的用户。它不托管模型、不提供 API 额度、
不替代 Agent，也不提供托管账号或同步服务。协议转换不能增加上游供应商没有提供的能力、
权限或额度。Agent 更新配置格式或界面后，适配可能需要调整。

## 常用流程

1. 在「供应商」中添加或导入服务，选择要使用它的 Agent。
2. 选择模型，在对应 Agent 的「待应用修改」中编辑配置。
3. 检查 diff 后应用 Agent 修改；被改写的配置文件会先备份。
4. 测试连接，按需重启 Agent；需要时在「历史与回滚」中查看或恢复可用备份。

需要区分保存范围：**保存供应商库会立即写入**，添加到 Agent 的配置先进入草稿，应用后才写入。
**网关设置和转发生效于操作当下**，包括准备 Agent 草稿时创建的网关资源。
丢弃草稿不会撤销已经保存的供应商库或网关修改。同步导入遵循同样的边界：
供应商库立即保存，Agent 修改进入草稿。详见[数据、联网与恢复说明](docs/data-and-network.md)（英文）。

## 主要功能

- **供应商库**：API 地址和密钥填一次，所有 Agent 共用。内置 21 套模板，覆盖常见厂商和编程套餐，多数只要贴一个 Key。
- **导入链接**：中转站（Sub2API、New API 等）的「导入到 CC Switch」按钮可以直接填好添加供应商的表单：在「供应商 → 链接导入」里粘贴链接，或者让 AgentPlus 打开 `ccswitch://` 链接（设置里开启，仅 Windows）。见[导入链接](#导入链接)。
- **模型列表**：拉取供应商提供的模型，再挑出每个 Agent 要显示的那些。
- **Agent 改动预览**：待应用的 Agent 修改先看 diff，再确认写入；被替换的配置文件会备份到 `~/.agentplus/backups/`。
- **本地网关**：在 OpenAI Chat、OpenAI Responses、Anthropic Messages 之间互转，流式输出和工具调用都支持——Claude Code 要接一家只提供 OpenAI 接口的服务，靠的就是它。
- **连接测试**：先测延迟，再发一个真实请求，地址、密钥、模型能不能用，切换之前就知道。
- **WSL**：WSL 发行版里的 Agent 和 Windows 共用同一份供应商库。
- **隐私模式**：`Ctrl+Shift+H` 遮住密钥、服务地址和用户名，截图或共享屏幕之前按一下。

Agent 也能从应用里一键重启。另外还顺手做了：命令面板（`Ctrl+K`）、关掉窗口后让网关继续跑的托盘图标、安装前自校验签名的应用内更新，以及中英文界面。

## 安装

从 [Releases](https://github.com/cnklpz/AgentPlus/releases/latest) 下载最新版本。

**Windows 10/11（x64）**：`AgentPlus_<版本>_x64-setup.exe`。安装包还没签名，首次运行时 SmartScreen 可能会拦一下，点「更多信息 → 仍要运行」即可。

**macOS 11+（实验性支持）**：Apple 芯片选 `_aarch64.dmg`，Intel 芯片选 `_x64.dmg`。应用没有公证，需要在「系统设置 → 隐私与安全性」里放行。要是 macOS 一口咬定应用「已损坏」，执行：

```bash
xattr -cr /Applications/AgentPlus.app
```

暂不提供 Linux 安装包。

更新在启动时检查，可在「设置 → 通用 → 关于」中安装。

## 截图

<table>
  <tr>
    <td width="50%"><img src="docs/images/providers-zh.png" alt="供应商库"></td>
    <td width="50%"><img src="docs/images/codex-models-zh.png" alt="模型列表"></td>
  </tr>
  <tr>
    <td align="center">供应商库，按 API 服务分组</td>
    <td align="center">挑选 Codex 里显示哪些模型</td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/images/gateway-zh.png" alt="本地网关"></td>
  </tr>
  <tr>
    <td colspan="2" align="center">网关的流量、耗时和失败率</td>
  </tr>
</table>

## 支持的 Agent

AgentPlus 能识别 15 个 Agent，读取和写入这些配置文件：

| Agent | 配置文件 |
|---|---|
| Codex（桌面版和 CLI） | `~/.codex/config.toml`、`models.json` |
| Claude Code | `~/.claude/settings.json` 中的 `env` |
| OpenCode | `~/.config/opencode/opencode.json(c)`、项目目录下的 `opencode.json` |
| MiMo Desktop | `~/.config/mimocode/mimocode.jsonc` |
| ZCode | `~/.zcode/v2/provider_config.json` |
| Gemini CLI | `~/.gemini/settings.json` |
| Qwen Code | `~/.qwen/settings.json` |
| Kimi Code | `~/.kimi-code/config.toml` |
| Kilo Code | `~/.config/kilo/kilo.json(c)` |
| CodeBuddy | `~/.codebuddy/models.json` |
| Droid（Factory） | `~/.factory/settings.json` |
| Hermes | `$HERMES_HOME/config.yaml` |
| pi | `~/.pi/agent/models.json` |
| OpenClaw | `~/.openclaw/openclaw.json` |
| Trae | 仅支持识别。自定义模型保存在账号里，需要按 AgentPlus 给出的步骤手动添加 |

列表里只会出现检测到的 Agent。装在非常规位置的话，可以在「设置 → Agent 识别」中指定目录。

<details>
<summary><b>Codex</b></summary>

- 固定供应商 ID，切换 API 服务后历史会话仍然可见。
- 模型列表按供应商保存，切换时自动加载。
- 浏览历史会话，查看某个会话为什么被隐藏。会话可以迁移到别的供应商（支持撤销），也可以复制 `codex resume` 命令。
- 检查数据库、缺失文件和过大的日志，清理前自动备份。
- 用 ChatGPT 登录后可以导入官方模型目录。
- 实验性非官方桌面界面补丁：Fast 显示、模型名称及用量相关界面。这些功能依赖 Codex 内部实现，详见[作用范围与关闭方法](docs/architecture.md#experimental-codex-ui-patches)（英文）。

</details>

<details>
<summary><b>Claude Code</b></summary>

- 每个供应商保存一套配置，切换时写进 `settings.json` 的 `env`。自己手写的配置也能导入进来。
- 设置默认模型，以及 Opus、Sonnet、Haiku 和子代理分别用哪个模型。
- 其他协议的 API 走本地网关，由它转换成 Claude Code 使用的 Anthropic 协议。
- 可以关掉非必要流量，以及 Git 提交里的 Co-Authored-By 署名。

</details>

<details>
<summary><b>OpenCode 和 Kilo Code</b></summary>

- 支持项目级配置，并标出哪些设置继承自全局配置。
- 常用设置用表单改：默认模型、`small_model`、启用的供应商、分享、自动更新、权限。
- 通过 `opencode auth` 登录的供应商只读显示。

</details>

<details>
<summary><b>ZCode 和 MiMo Desktop</b></summary>

- ZCode：模型顺序、各模型的上下文规则、思考过程显示、记忆、托盘。
- MiMo Desktop：账号内置的模型、技能目录、托盘行为、语音反馈。
- 两个应用都能从 AgentPlus 里直接重启。

</details>

<details>
<summary><b>其他 Agent</b></summary>

- Gemini CLI：多套配置之间切换。环境变量或项目里的 `.env` 覆盖了当前设置时，会给出提示。
- Kimi Code 和 Hermes：只重写有改动的配置块，注释和格式原样保留。
- CodeBuddy：IDE 和 CLI 共用一份配置，改完一秒内热加载。
- Droid：写入前重新读一遍配置，Droid 运行期间做的改动不会被覆盖。
- OpenClaw：地址或密钥变了，它为各 agent 生成的模型文件会一起更新。
- pi：按 pi 支持的格式写入，无效字段不会让整个文件读不出来。
- 配置里的 `$VAR`、`${VAR}`、`env_key` 等变量引用会原样保留。

</details>

## 导入链接

AgentPlus 能打开 `agentplus://v1/import?…` 链接，参数和 CC Switch 的 `ccswitch://v1/import?…` 供应商链接相同：已经有「导入到 CC Switch」按钮的网站只要换掉协议名即可。

```text
agentplus://v1/import?resource=provider&app=claude&name=My%20Relay&endpoint=https%3A%2F%2Frelay.example.com&apiKey=sk-...&model=claude-sonnet-5
```

- `app`：`claude`（Anthropic）、`codex`（OpenAI Responses，`endpoint` 要带 `/v1`）、`gemini`、`opencode`、`openclaw`、`hermes`；其他值按 OpenAI Chat 兼容接口添加。表单里会勾选对应的 Agent。
- `name`、`endpoint`（逗号分隔时取第一个）、`apiKey`、`homepage`，以及组成模型列表的 `model` / `sonnetModel` / `opusModel` / `haikuModel`。也会读取 CC Switch 的 base64 `config`；`usage*` 参数忽略。
- `agentplus://` 链接还可以带 `api`（`responses`、`chat`、`anthropic`、`gemini`）和 `models`（逗号分隔）。

链接用于填表，点「添加」之前不会保存。链接可能包含 API Key，应按密钥保管；拉取模型或测试前先核对目标地址。

## 从源码构建

AgentPlus 基于 [Tauri 2](https://tauri.app)：前端是 `src/` 下的 React + TypeScript，后端是 `src-tauri/` 下的 Rust。需要 Node.js 18+、当前稳定版 Rust 工具链和 [Tauri 系统依赖](https://tauri.app/start/prerequisites/)。

安装依赖并启动开发环境：

```bash
npm ci
npm run tauri dev
```

打包与检查：

```bash
npm run tauri build    # 生成安装包
npm run check          # 前端类型检查和测试
cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
```

想在浏览器里预览界面（用的是演示数据）可以跑 `npm run dev`。

当前开发流程见[架构说明](docs/architecture.md)、[开发与发布指南](docs/development-and-release.md)
和[贡献指南](CONTRIBUTING.md)（英文）。旧[设计草案](docs/design.html)是历史资料，包含尚未实现的内容。

## 数据与支持

供应商密钥和配置备份可能以明文保存在本机。隐私模式只遮挡界面，不加密文件或剪贴板。
同步文件加密是单独的可选功能，不会加密本地密钥。更新检查、模型元数据、延迟测试和使用供应商时
也会产生网络请求。共享文件或开启同步前，请阅读[数据与联网说明](docs/data-and-network.md)（英文）。

可通过 [GitHub Issues](https://github.com/cnklpz/AgentPlus/issues) 提交可复现的问题和范围明确的功能建议。
请附 AgentPlus 版本、操作系统、受影响 Agent 的版本及脱敏后的复现步骤。
维护按实际能力进行，不承诺响应时间。漏洞请按[安全报告说明](SECURITY.md)处理，
不要公开粘贴密钥、配置文件或漏洞利用细节。

## 许可证

[AGPL-3.0-only](LICENSE)。Copyright (C) 2026 cnklpz。

如需在 AGPL 条款之外使用（例如闭源分发），请联系作者获取商业授权。
