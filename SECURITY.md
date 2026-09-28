# Security

## Reporting a vulnerability

Do not put API keys, sync passwords, private configuration, conversation content or an
exploitable proof of concept in a public issue.

Check the repository's [Security page](https://github.com/cnklpz/AgentPlus/security).
If GitHub offers **Report a vulnerability**, use that private reporting flow. Its
availability is controlled by repository settings and is not guaranteed by this document.
If it is unavailable, open an issue containing only a request for a private security contact;
wait for a private channel before sharing details. No private email address or guaranteed
response time is currently advertised.

Once a private channel is available, include the AgentPlus version, OS, affected agent
version, minimal redacted reproduction, impact and any mitigation. Use fake credentials
and disposable data. If a real credential has been exposed, revoke or rotate it with its
provider rather than relying on deletion of a local copy.

## Support scope

AgentPlus is actively maintained and pre-1.0. Security fixes target the current release;
there is no promised long-term support or backport schedule for older versions. Windows is
the primary platform; macOS support and the optional Codex desktop UI patches are
experimental. A dependency on another agent's private interface may break after updates.

## Security boundaries

- The app can read and write agent configuration, manage provider credentials and forward
  requests. It runs with your account's file access; it is not a sandbox for untrusted tools.
- The provider library and configuration backups can hold plain-text keys. Privacy mode
  is screen masking, not encryption. Protect the account, device and exported copies.
- Sync payload encryption is optional. Windows protects the saved sync password with
  DPAPI; non-Windows builds use local file permissions and do not use a system keychain.
- The local gateway is intended for loopback use. Do not expose it or an experimental
  Codex debugging port to an untrusted network.
- Updating uses signed updater packages. Windows installers are currently not code-signed
  and macOS apps are not notarized; updater signing does not remove those limitations.

Read [data, network access and recovery](docs/data-and-network.md) for external requests,
key copies, logs, retention and deletion scope. The [architecture guide](docs/architecture.md)
describes the unofficial Codex patches and their exit path.
