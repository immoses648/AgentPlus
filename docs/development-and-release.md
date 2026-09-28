# Development and release

## Local development

Use Node.js 18+ (CI uses Node.js 20), the current stable Rust toolchain and the platform's
[Tauri 2 prerequisites](https://tauri.app/start/prerequisites/). Use npm with the checked-in
`package-lock.json` and Cargo with `src-tauri/Cargo.lock`. No application `.env` file or
production service credential is required to build. Real provider tests require your own
provider credentials entered through the app; never put them in fixtures or screenshots.

From the repository root:

```sh
npm ci
npm run tauri dev
```

`npm run dev` starts the browser-only demo at port `1420`. It is useful for layout review,
but the demo does not exercise Rust, real agent files, the gateway or the installer.
The frontend build output is `dist/`; Tauri invokes `npm run build` before packaging.

## Verification

Run frontend type checks and tests, then build the frontend:

```sh
npm run check
npm run build
```

From `src-tauri/`, run backend checks:

```sh
cargo clippy --all-targets -- -D warnings
cargo test
```

Back at the root, build the local installer when a change affects desktop behavior:

```sh
npm run tauri build
git diff --check
```

Local builds do not need an updater signing key. CI runs the frontend checks and Windows
and macOS backend checks. Backend tests include temporary-file persistence, restoration,
sync and loopback gateway requests; frontend unit tests do not replace interaction testing.

For a change to a critical flow, use disposable agent configurations and fake or temporary
credentials. Exercise preview, apply, failure reporting and rollback through the desktop
app. Check UI changes at a normal desktop size and the minimum 1100 x 700 window, including
keyboard navigation and both languages. Inspect a narrow/mobile-sized browser preview for
regressions, but do not treat it as a supported mobile interface. Test protocol changes with real local
HTTP requests. A browser demo passing is not evidence that native file writes succeeded.
Report checks actually run and any platform or installer testing that remains unverified.

## Release workflow

Releases are deliberate maintainer actions. Preparing code or a pull request does not
authorize versioning, tag pushes or publication.

1. Review changes and tests, then move the applicable bilingual `Unreleased` notes into a
   `## <version>` section in `CHANGELOG.md`. Include migration, security and known-issue
   information when relevant; do not hide compatibility changes under a generic label.
2. Commit the release notes as `docs(changelog): add <version> notes`. On a clean tree,
   run `npm version <version>` only when preparing the authorized release. Its hook syncs
   npm, Tauri and Cargo versions, stages the version files, creates a commit and tags it.
3. Push the reviewed commit and its explicit `v<version>` tag only when authorized. The
   Release workflow calls CI on that tagged commit. Only successful checks allow creation
   of the draft release and the Windows/macOS build matrix.
4. The tag must match `tauri.conf.json`, and a matching changelog section must exist.
   Build jobs upload Windows x64, macOS Apple silicon and macOS Intel artifacts. A single
   final job waits for all builds and writes `latest.json` from their signatures.
5. Review the draft's notes and artifacts, exercise installation and an upgrade from the
   previous release on supported platforms, and inspect the updater manifest before
   explicitly publishing the draft. Drafts are invisible to installed copies' update check.

The repository's Actions secrets `TAURI_SIGNING_PRIVATE_KEY` and
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD` provide updater signing material. The workflow uses
GitHub's supplied `GITHUB_TOKEN` for release access. Keep private keys out of the repository,
logs and support reports, and preserve a secure recovery copy. These signatures authenticate
updates to AgentPlus; they are not Windows Authenticode signing or macOS notarization.
The current README states the platform-signing limitations.

Do not replace the updater verification key, public update URL, application identifier,
data paths or deep-link scheme as a routine branding edit. Existing installations and
external import links depend on them. Any intended change needs a tested compatibility path.

If a platform build fails, keep the release as a draft and rerun the failed job after
diagnosis. Do not publish partial artifacts. The scheduled `warm-cache` job only builds
dependency caches and does not publish a release.

## Upgrades and rollback

An app update changes application binaries; it does not undo prior edits to an agent's
configuration. Use History for supported configuration restoration. Keep a private copy of
the AgentPlus data directory and affected agent configurations before a risky upgrade.
Backups may contain keys; the [data guide](data-and-network.md) describes their scope.

There is no automatic application downgrade command. To return to an earlier release,
quit AgentPlus completely, select the intended prior artifact from GitHub Releases and
install it using the platform's normal installer flow. Disable automatic update checks
temporarily if needed. Do not assume an older version can read newer state: inspect release
notes, and restore a matching private data backup with AgentPlus and affected agents stopped
when a format change requires it. Keep the newer data copy until recovery is verified.

For a faulty published release, investigate before changing release assets. Prefer a tested
follow-up release with explicit recovery guidance. Never silently replace signed packages
with different bytes under the same version or assume re-publishing an old version performs
an automatic downgrade on installed clients.

## Troubleshooting and contributions

Use Settings to inspect/export the diagnostic log and the Gateway page to inspect local
forwarding state. Redact and review exports before sharing. Report exact app/agent versions,
platform, reproduction steps and what was expected. See [CONTRIBUTING.md](../CONTRIBUTING.md)
and [SECURITY.md](../SECURITY.md). The historical `design.html` is not a verification checklist
or a promise that its proposed commands exist.
