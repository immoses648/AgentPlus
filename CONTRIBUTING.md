# Contributing

AgentPlus is independently maintained. Bugs, focused improvements and scoped feature
requests are welcome through [GitHub Issues](https://github.com/cnklpz/AgentPlus/issues)
and pull requests. For a large architectural or product change, explain the problem and
proposed scope before implementing it. Maintenance is best effort, without a guaranteed
response time. Follow [SECURITY.md](SECURITY.md) for vulnerabilities.

Read [AGENTS.md](AGENTS.md), the [architecture guide](docs/architecture.md), and the
[development and release guide](docs/development-and-release.md). They cover repository
boundaries, commands, bilingual copy and commit conventions.

Keep changes focused and preserve unrelated work. Use the established npm/Cargo lockfiles
and existing architecture. AgentPlus's independent identity, AGPL-3.0-only license, existing
data paths and public protocols are not incidental names to replace. Optional Excessive
motion remains a supported user preference; visual work must still respect reduced motion.

Before requesting review:

- Explain the concrete problem, resulting behavior and any compatibility or data impact.
- Add meaningful regression tests for changed logic and exercise the public interaction
  when a UI, native file operation, protocol or release flow changes.
- Run the relevant commands from the development guide. State what passed, what failed
  and what could not be checked on your platform.
- Update both English and Chinese interface text and synchronize affected guides and
  user-facing release notes. Use fake domains and credentials in examples.
- Describe how to recover from changes to stored data or agent files. Do not attach live
  configuration, keys, full backups or unreviewed logs to a pull request.
- Keep commits in the required `type(scope): description` format and stage only the
  intended files. When using a coding agent, authorize commits and pushes explicitly.

Do not create a version tag or publish a release as part of an ordinary contribution.
