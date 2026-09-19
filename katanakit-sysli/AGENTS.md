# AGENTS.md — katanakit-sysli

TUI + CLI Rust para el ecosistema systemd (`ksys`). Binario único, sin sudo total.

## Commands (orden: clippy → fmt → test)

- `cargo clippy --all-targets` — cero warnings (gate).
- `cargo fmt --check` — formato (gate; `cargo fmt` para arreglar).
- `cargo test` — tests (hoy: invariantes de `profiles`).
- `cargo build --release` — binario `target/release/ksys`.
- `node scripts/sync-version.cjs --check` — `Cargo.toml` == `npm/package.json`.
  (Los dirs `npm-linux-*` están congelados en 0.1.0, deprecados desde 0.2.0.)
- `bash -n scripts/dev/sys-menu.sh` — sintaxis del menú gum.

## Architecture

- `src/systemd.rs` — única capa que habla con systemd (D-Bus primero,
  `systemctl` fallback). `Scope { System, User }` viaja en cada llamada:
  system = system bus, user = session bus + `systemctl --user`.
- `src/profiles.rs` — recetas built-in como datos (`&[Step]`), nunca lógica
  dispersa. Se agregan con PR + tests, no con config (decisión).
- `src/main.rs` — subcomandos CLI = "las funciones" (misma lógica del TUI,
  sin duplicar). El menú gum los llama; si no hay binario, cae a `systemctl`.
- `src/app.rs` — estado TUI; `src/ui.rs` — solo render (sin I/O);
  `src/journal.rs` — lecturas de journal (scope-aware).

## Safety rules (no negociables)

- Jamás `sudo` dentro del código: polkit autentica por acción.
- Toda acción (`start/stop/restart/enable/disable/mask/unmask`) y
  `daemon-reload` pide confirm `y/n` en TUI; perfiles CLI exigen `--yes` explícito.
- `profiles::apply` no corta al primer error: reporta paso por paso.
- Nunca auto-aplicar perfiles en tests ni en CI: solo invariantes
  (nombres únicos, scopes, orden de pasos) + comandos de lectura.

## Git workflow

- Rama `dev` (conventional commits). Nunca `feature` → `main` directo.
- CHANGELOG `[Unreleased]` para cambios visibles; README al día con features.
- Release npm por tag `npm-v*` (workflow `npm-platform.yml`): compila x64+arm64
  y publica el paquete único `katanakit-sysli` vía Trusted Publisher OIDC
  (sin tokens). `npm/bin/ksys-*` los pone el CI, jamás se commitean.
