# Data, network access and recovery

This guide describes the desktop application's current storage and external requests.
AgentPlus is local software, but local storage and network independence are different
properties. Provider usage, updates and metadata retrieval can contact external services.

## What is stored

`~` means the home directory of the account running AgentPlus. The data directory can be
opened from Settings. On Windows, choosing a WSL agent changes the target agent paths;
AgentPlus's own library and backups remain in the Windows user's `.agentplus` directory.

| Data | Location | Protection and lifetime |
| --- | --- | --- |
| Provider library, agent profiles, gateway configuration, local gateway credentials, sync options | `~/.agentplus/store.json` | Provider API keys can be plain text. The file is not an encrypted credential vault. |
| Agent configuration | Each agent's own paths listed in the README | Format and credential protection depend on the agent. Applying a direct provider can copy its key into these files. |
| Configuration backups and profile snapshots | `~/.agentplus/backups/` | Can contain the original API keys even when the history diff masks them. No automatic expiry. |
| Diagnostic log | `~/.agentplus/logs/` | Enabled by default; seven-day retention by default, adjustable from 1 to 90 days; 50 MB total and 10 MB per daily file limits. |
| Model metadata cache | `~/.agentplus/models-dev.json` | Downloaded public catalog used to suggest model capabilities. |
| UI preferences | The application's WebView local storage | Language, theme, motion, privacy mode and other per-install choices. Unsaved agent drafts are in memory. |
| Shared snapshot and records | Chosen folder's `agentplus-sync.json` and `agentplus-sync-history/` | Controlled by sync encryption and key-inclusion options; also accessible to the folder's storage/sync provider. |

The app uses private file permissions for its sensitive state where supported, but an
administrator, a process running as you, a device backup or an exported copy may still read
it. Privacy mode masks values on screen; it does not encrypt files, erase clipboard history
or protect a key after you copy it. Do not upload the data directory, full configuration
files, import links containing keys, or unreviewed backups to an issue or chat.

## Sync encryption and passwords

Without a sync password, exports are JSON and omit API keys by default. Enabling **Sync API
keys** without a password writes those keys in plain text after a warning. With a password,
the payload uses AES-256-GCM with an Argon2id-derived key and fresh salt/nonce per export.
The format, export time, machine identity and encryption parameters remain in the header;
the header is authenticated but is not hidden. Encryption protects the shared payload, not
the local provider library, agent files or prior snapshots.

The saved sync password uses Windows DPAPI on Windows. On macOS and other non-Windows
builds it is stored in plain text in the local store, protected only by file permissions;
it does not use macOS Keychain. A Windows-protected password copied to another account or
device may need to be entered again. Keep a separate secure copy of the password; a text
key export and the clipboard contain the actual password. Anyone with both the password
and a snapshot can read that snapshot.

Changing a password or turning key inclusion off affects future exports, not existing
records, cloud version history or other devices. Record retention keeps between 5 and 50
exports, according to the selected setting. Reducing it deletes older records from the
shared folder. Automatic sync is opt-in; another device's unreviewed export prevents it
from silently overwriting that device's snapshot. Compare before importing. Folder sync
itself is performed by your chosen cloud client, NAS or removable storage, not AgentPlus.
If an agent's existing configuration or required credentials cannot be read, export and
comparison stop instead of accepting incomplete state. The shared snapshot is not replaced
by a partial export, and a failed comparison does not mark it as reviewed. Repair the
affected configuration and retry.

## Network access

| Trigger | Destination and data | Control or limitation |
| --- | --- | --- |
| Startup update check | GitHub Releases for `cnklpz/AgentPlus`; update metadata, then release artifacts when installing | Startup checks are on by default and can be disabled in Settings. Installation requires an action; updater packages are signature-verified. |
| Model catalog cache missing or more than seven days old | `https://models.dev/api.json`; download of the public catalog without provider keys or prompts | Checked in the background at startup; the current app has no dedicated switch for this fetch. Cached/built-in metadata can still be used when it fails. |
| Opening agent/provider pages with automatic latency enabled, or clicking a latency test | The displayed provider or built-in official endpoint; a small GET request, normally without an API key | Automatic latency is on by default and can be disabled in Settings. A local-gateway probe uses a local test token and may cause the gateway to contact its upstream. A successful response time does not prove a key or model works. |
| Fetching provider models, including any fetch offered by an import dialog | The chosen provider URL with its configured authentication | Verify the destination before fetching. Model metadata is provider-supplied and may be incomplete. |
| Running a connection test | The provider's generation endpoint, selected model, key and a fixed short test prompt | This is a real generation request and may consume tokens/credits. |
| Using an agent configured through the gateway | Chosen upstream provider; the agent's request content and configured upstream credentials | The agent's messages and tool content reach that provider. Turning the gateway off prevents this local forwarding but also stops agents that depend on it. |
| Importing Codex's official catalog | Codex performs its normal official sign-in and catalog fetch; AgentPlus reads the resulting local cache | The temporary configuration flow can be completed or cancelled in the app. |
| Opening external links | Your system browser and the selected website | The browser and website apply their own data handling. |

Remote services can observe connection metadata such as source IP addresses regardless of
whether an application key is sent. Protocol conversion does not anonymize request bodies.
AgentPlus does not automatically upload its diagnostic logs to a reporting service.

## Logs and deletion scope

Diagnostic entries cover errors, detection, restarts and failed gateway operations. The
logger scrubs known key/token patterns, private hosts, IP/email addresses and account names
in paths before writing and again on export. Scrubbing is best effort, so review exported
logs before sharing. Settings can disable logging, adjust retention, export or clear logs.
Clearing logs does not clear the provider library or other applications' own logs.

Deleting a library entry removes it from the local library; it does not revoke the remote
API key or erase copies already written to agent configuration, backups, sync records,
clipboard managers or cloud version history. Removing a provider from an agent is a draft
until applied. The Providers page can combine an immediate library deletion with queued
agent deletions; inspect the confirmation's scope. Deleting a gateway route changes
forwarding immediately and does not revoke its upstream credential.

In **History & rollback**, you can explicitly delete an individual ordinary configuration
backup after reviewing its scope and confirming. This permanently removes that local
recovery copy, not the live agent configuration. Deletion requires a recognized agent and
a valid ordinary backup manifest; recovery-specific material such as Codex cleanup,
session-repair undo and official-model-fetch backups is protected. Invalid paths and links
are refused. There is no automatic backup expiry or bulk-delete command.

A locked file or another filesystem error can interrupt deletion after some files have
already been removed. AgentPlus reloads the history and blocks restoration of incomplete
backups. Release the reported file lock or repair access, refresh, and retry deleting the
remaining ordinary backup. Do not use a partially deleted copy for manual restoration.

Deleting a sync record removes that record from the shared folder for all devices that
sync it. Deleting the record that duplicates the current snapshot leaves
`agentplus-sync.json` in place. Cloud trash/version history and disconnected devices may
retain copies. Removing a sync password does not decrypt or erase existing snapshots.

For a compromised API key, revoke or rotate it with the provider first, then update the
library and affected agents and remove obsolete copies you no longer need. File deletion
is not a guarantee of secure erasure on an SSD, a backup service or a shared drive.

## Recovery

For a configuration mistake, open **History & rollback**, inspect the selected backup's files and
profile snapshot, and restore it only after checking the affected scope. Restore creates a
safety backup of the current state, so that rollback can itself be reversed. A missing
original target or unusable required profile snapshot can block restoration. Multi-file
write failures are reported; stop and inspect the reported backup rather than repeatedly
applying the same operation.

An unreadable, empty or invalid existing `store.json` is a storage error, not a new empty
library. AgentPlus blocks writes and shows a recovery notice with access to the data folder
and a refresh action. Preserve the original file, restore file access or repair/replace it
from a known-good private copy, then refresh. Only an absent store represents a fresh
installation. The app does not silently reset a damaged store or repair it automatically.

Before a manual data restore, stop the agents that use the affected files and quit
AgentPlus from the tray. Preserve a private copy of the current data, including a damaged
file, before replacing anything. Restore from a known-good copy for the same environment.
Do not delete the whole `.agentplus` directory as a first troubleshooting step: it contains
the provider library, sync settings and recovery material. AgentPlus app updates and agent
configuration rollback are separate operations; see the [release guide](development-and-release.md#upgrades-and-rollback).

See [security reporting](../SECURITY.md) for private disclosure and
[architecture](architecture.md) for command, draft and gateway boundaries.
