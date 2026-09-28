# Architecture

## Current shape

AgentPlus is a local Tauri 2 desktop application. React 18 and TypeScript render the
interface; Rust reads agent configuration, writes reviewed changes, manages backups and
runs the optional local gateway. It has no hosted account service or hosted sync backend.
The `npm run dev` browser preview uses demo data and does not validate desktop operations.

```text
React interface -> typed calls in src/api.ts -> Tauri commands in src-tauri/src/lib.rs
  Agent draft -> adapters -> config files + AgentPlus profiles + backups
  Providers   -> library -> ~/.agentplus/store.json
  Gateway     -> routes + keys -> loopback HTTP -> chosen upstream provider
  Sync        -> shared-folder snapshot -> comparison -> library saves / agent drafts
```

## Boundaries and ownership

| Area | Main files | Responsibility |
| --- | --- | --- |
| Interface and orchestration | `src/App.tsx`, `src/components/` | User actions, pending drafts, dialogs and current status |
| Drafts and service grouping | `src/draft.ts`, `src/services.ts` | Pending operations and relationships between agents, library entries and routes |
| Desktop boundary | `src/api.ts`, `src-tauri/src/lib.rs` | Typed request/response shapes and command dispatch; blocking work stays off the UI thread |
| Agent adapters | `src-tauri/src/adapters/` | Agent-specific parsing, validation, preview and application of configuration changes |
| Local state and recovery | `store.rs`, `util.rs`, `history.rs` | Serialized state updates, atomic file replacement, backups and rollback |
| Providers and networking | `library.rs`, `net.rs`, `modelinfo.rs` | Shared provider definitions, explicit requests and model metadata |
| Gateway | `src-tauri/src/gateway/` | Local authentication, routing, protocol conversion, streaming, retry and circuit-breaker behavior |
| Sync | `sync.rs`, `seal.rs` | Shared-folder exports, encryption, comparison and import suggestions |
| Desktop lifecycle | `process.rs`, `tray.rs`, `update.rs`, `deeplink.rs` | Detection/restart, tray behavior, signed updates and provider import links |

Rust filenames without a directory above are under `src-tauri/src/`. English and Chinese
interface dictionaries live in `src/i18n/`; backend messages use `src-tauri/src/i18n.rs`.

## Write and recovery boundaries

An agent draft is an in-memory set of operations, not a saved configuration. Preview asks
the adapter for a diff; applying resolves the operations against the current environment
and writes the affected files. Where supported, formats and comments are preserved. The
store lock prevents interleaving of local read/modify/write operations, and individual
files are replaced atomically. This is not an all-or-nothing filesystem transaction across
every file or across multiple agents; errors and backup locations must remain visible.
Applying agent drafts requires a ready, successful diff preview; editing a draft or
refreshing invalidates the previous preview immediately. Context-menu application,
multi-agent application and applying before a restart open a review dialog. Each selected
agent must have a successful preview before confirmation. Unselected drafts stay pending;
failed changes remain available to retry. Cancelling the apply-before-restart review keeps
the agent running as it was, and a successful application restarts it only once.

The provider library, gateway settings and general settings have immediate save semantics.
Preparing a gateway-backed agent provider can save a library entry, create a route or start
the gateway before the agent draft is applied. A discarded agent draft does not undo those
resources. Sync imports save library entries directly and queue agent-specific changes for
review. A backup restores the scope recorded in it, not the entire computer or all settings.

The local gateway binds to `127.0.0.1` (default port `18650`). An enabled gateway can keep
running when the window is hidden in the tray. Quitting AgentPlus stops it, which affects
agents configured to use its local address. Upstream credentials and forwarding are handled
in Rust; the gateway is not intended to be exposed as a public network service.

## Experimental Codex UI patches

These optional desktop patches are unofficial, depend on Codex's internal UI bundles and
can stop matching after a Codex update. They are separate from ordinary configuration
settings such as the default model or `service_tier`.

When patches are enabled and Codex is restarted through AgentPlus, AgentPlus starts it
with a local DevTools port (`39229`) and modifies bundle responses during reload. The
current patch scope includes Fast-option visibility, full/short model names, the
client-side send restriction associated with the displayed account quota, and usage
banners. This changes local UI behavior; it does not grant server authorization, add
credits, bypass an upstream service's enforced limits, or guarantee that a provider
supports Fast. Hiding a banner is not evidence that quota remains available. Check the
actual provider's limits and billing.

Treat the debugging port as access to the local app: do not forward it to a network or
enable these patches on a device where untrusted local processes can inspect the session.
Patch progress reports missing matches; report the AgentPlus and Codex versions when it
fails rather than assuming an update is compatible.

To exit, turn off all UI patch options on the Codex page, apply the pending settings, then
fully quit and relaunch Codex normally (or restart through AgentPlus after disabling the
options). The injection changes loaded responses rather than installed Codex bundle files.
Changing the default Fast configuration is a separate setting and must be undone separately.

## Related documents

- [Data, network access and recovery](data-and-network.md)
- [Development and release](development-and-release.md)
- [Security reporting](../SECURITY.md)

`design.html` is an archived early draft, not a source of current requirements. Changes to
commands, formats, data boundaries or release behavior should update these current guides.
