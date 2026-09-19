# ksys — lazygit for the whole systemd ecosystem

`ksys` (from **katanakit-sysli**) manages **all of systemd**, not just services:
units, timers, journal, boot, network, sessions and devices — in one terminal UI.
No full sudo: polkit authenticates **per action**, only when you confirm one.

Works on any distro running systemd (tested on BigLinux/Manjaro systemd 261;
same D-Bus API on Arch, Debian, Fedora). If a subsystem is inactive
(e.g. networkd on a NetworkManager desktop), it says so instead of breaking.

## Install

```bash
npm i -g katanakit-sysli
ksys
```

Requirements: **Linux + systemd**. Both binaries (x64, arm64) ship inside this
single package — no downloads at install time. On macOS/Windows the command
explains it needs Linux instead of crashing.

> npm is only the installer (esbuild pattern): the core is 100% Rust.

## 5-minute TUI tour

Seven tabs, one for each part of the systemd ecosystem:

| Key | Tab |
|---|---|
| `1` | Units (services, sockets…) |
| `2` | Timers |
| `3` | Journal |
| `4` | Boot (`journalctl -b` + `bootctl`) |
| `5` | Network (`networkctl` / networkd) |
| `6` | Sessions (`loginctl`) |
| `7` | Devices (udev) |

Left pane = list, right pane = details + live journal. Full key map:

| Keys | Action |
|---|---|
| `q` / `Esc`, `Ctrl-C` | quit |
| `j`/`k` or `↑`/`↓` | move |
| `Tab` / `Shift-Tab` / `1..7` | next / previous / direct tab |
| `s` `t` `r` `e` `d` `m` | start / stop / restart / enable / disable / **mask** (`M` = unmask) — always asks `y/n` |
| `U` | toggle scope **system ⇄ user** (header shows `[system]` / `[user]`) |
| `R` | `daemon-reload` (asks `y/n`) |
| `P` | built-in profiles picker (`j/k` choose · `Enter` confirm · `Esc` close, then `y/n`) |
| `/` + `Enter` | filter |
| `f` | follow journal |

## CLI cookbook

Everything the TUI does is also a subcommand — scriptable, same logic,
used by the bundled gum menu (`scripts/dev/sys-menu.sh`):

```bash
# List running services (system and user scopes)
ksys list --state running --type service
ksys list --user --state running

# Status without parsing text
ksys status upower
ksys status gcr-ssh-agent.service --user

# Power stack off
ksys stop upower && ksys disable upower && ksys mask upower
ksys stop power-profiles-daemon && ksys disable power-profiles-daemon && ksys mask power-profiles-daemon

# Modems, hybrid graphics, thunderbolt off
for u in ModemManager switcheroo-control bolt; do ksys stop $u && ksys disable $u && ksys mask $u; done
# ...or one confirmation for all: ksys profile no-modem --yes

# Print on demand (services off, socket activates when printing)
ksys stop cups-browsed && ksys disable cups-browsed
ksys stop cups.service && ksys disable cups.service
ksys enable cups.socket && ksys start cups.socket

# SSH agent + accessibility (user scope only)
ksys stop --user gcr-ssh-agent.service && ksys mask --user gcr-ssh-agent.service
ksys stop --user gcr-ssh-agent.socket && ksys mask --user gcr-ssh-agent.socket
ksys stop --user at-spi-dbus-bus && ksys mask --user at-spi-dbus-bus

# Reload systemd
ksys daemon-reload
```

## Built-in profiles

Versioned recipes (one confirmation per profile, per-step report, polkit per action).
New ones are added by PR with tests — never config files.

| Profile | What it does |
|---|---|
| `no-power` | stop+disable+mask `upower`, `power-profiles-daemon` |
| `no-modem` | stop+disable+mask `ModemManager`, `switcheroo-control`, `bolt` |
| `print-on-demand` | stops/disables `cups-browsed`+`cups.service`, enables+starts `cups.socket` |
| `no-ssh-a11y` | stop+mask `gcr-ssh-agent.*`, `at-spi-dbus-bus` (user scope) |

TUI: press `P`. CLI: `ksys profiles` to list, `ksys profile <name> --yes`
(refuses without `--yes`).

## System vs user scope

`U` switches the manager: **system** (PID 1) or **user** (your session).
User units (`gcr-ssh-agent`, `at-spi`, your desktop apps) exist **only** on the
session bus — without the user scope they are invisible.
`ksys --scope user` starts directly there. CLI: add `--user` to any command.

## Safety

- Read-only by default. No root daemon, no blanket sudo.
- Every action (`start/stop/restart/enable/disable/mask/unmask`) and
  `daemon-reload` asks `y/n` in the TUI; CLI profiles require explicit `--yes`.
- A profile never stops at the first error: it reports step by step.

## Trying it in Docker (nothing installed on your machine)

```bash
# Level 1 — install path only (no systemd inside): verifies packaging + launcher
bash docker/test-install.sh
# Level 2 — real systemd: full CLI/TUI test in a privileged container
bash docker/test-systemd.sh
```

## Troubleshooting

| Symptom | Cause |
|---|---|
| Few/no units, status shows `D-Bus fallo (...), fallback systemctl` | PID 1 is not systemd (plain container, WSL1). Use `docker/test-systemd.sh`. |
| Network tab shows `networkd no activo` | Desktop uses NetworkManager instead of networkd. Expected. |
| `bootctl` shows permission errors | Reading EFI entries needs root. Journal boot logs still work. |
| Detail pane shows `(sin logs o sin permiso journal)` | Your user can't read that unit's journal. `journalctl -u <unit>` shows why. |

## Uninstall

```bash
npm rm -g katanakit-sysli
```

Masked/disabled units stay as you left them — `ksys` never reverts your system.
To undo e.g.: `ksys unmask bolt && ksys enable bolt && ksys start bolt`.

## From source (developers)

```bash
cargo run -- --kind service   # or timer; --scope user
cargo build --release        # binary at target/release/ksys
./scripts/dev/sys-menu.sh    # gum menu (uses the ksys CLI, falls back to systemctl)
```

Gates: `cargo clippy --all-targets` (zero warnings) → `cargo fmt --check` →
`cargo test` → `node scripts/sync-version.cjs --check` (`Cargo.toml` == npm version).

## Layout

```
src/main.rs       entry + event loop + CLI (subcommands = functions)
src/app.rs        TUI state: tabs, scope, filter, confirm, follow, profile picker
src/systemd.rs    Scope System/User · D-Bus ListUnits + fallback · mask/unmask · daemon_reload
src/profiles.rs   4 built-in profiles + per-step apply report (+ tests)
src/journal.rs    scope-aware journalctl tail
src/ui.rs         split list/detail/journal + tabs + profile popup
scripts/dev/      gum menu (calls the ksys CLI)
scripts/sync-version.cjs  keeps Cargo.toml == npm version
npm/              single npm package (bundled x64+arm64 binaries, CI-built)
docker/           install-path and real-systemd tests
```

## Releasing (maintainer)

```bash
# 1. Bump Cargo.toml, sync npm:
node scripts/sync-version.cjs
# 2. Tag — CI builds both arches and publishes the single package via OIDC:
git tag npm-v0.2.0 && git push origin npm-v0.2.0
```
