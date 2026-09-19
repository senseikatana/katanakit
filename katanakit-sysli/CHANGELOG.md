# CHANGELOG — katanakit-sysli

## [Unreleased]

## [0.2.0] — 2026-09-14 — control total systemd + CLI + paquete npm único

Paquete único npm 0.2.0 (consolidación + docs + Docker):

- [x] Consolidar npm en paquete único `katanakit-sysli@0.2.0` (bins x64+arm64 dentro, shim por arch)
- [x] README raíz en inglés orientado a uso (cookbook CLI, perfiles, scope, Docker, troubleshooting)
- [x] `npm/README.md` corto para la página npm
- [x] Docker `test-install` (pack+install limpio) y `test-systemd` (systemd real privilegiado)
- [x] `bin_name = "ksys"` (el help no muestra `ksys-x64`)
- [x] Publish por Trusted Publisher OIDC, sin `NPM_TOKEN`
- [x] `sync-version.cjs` simplificado: solo `Cargo.toml` == `npm/package.json` (`npm-linux-*` congelados en 0.1.0)
- [ ] Despublicar `@senseikatana/ksys-linux-*` (ventana 72h hasta ~17 sep 17:10Z, con OTP) o deprecar
- [ ] Conectar Trusted Publisher en npmjs.com (katanakit-sysli → repo + workflow)
- [ ] Tag `npm-v0.2.0` y verificar publish OIDC + install en Docker

Control systemd + CLI (scope + mask + perfiles):

- [x] `Scope::System/User` en `systemd.rs` (system bus + session bus, `systemctl --user`)
- [x] Acciones `mask/unmask` en TUI (`m`/`M`) y CLI, con confirm
- [x] `daemon-reload` en TUI (`R`) y CLI (`ksys daemon-reload [--user]`)
- [x] Filtro `--state running` en `ksys list` (LISTAR SERVICIOS ACTIVOS, ambos scopes)
- [x] `ksys status <unit>` (active/enabled sin parsear texto)
- [x] `src/profiles.rs` built-in: `no-power`, `no-modem`, `print-on-demand`, `no-ssh-a11y`
- [x] Picker de perfiles en TUI (`P`) + `ksys profile <nombre> --yes` (sin `--yes` se niega)
- [x] `sys-menu.sh` con scope, mask, daemon-reload, running y perfiles vía CLI
- [x] Tests invariantes de perfiles (4/4) + pruebas reales de lectura en BigLinux
- [x] `AGENTS.md` creado; README con CLI, perfiles y scope
- [x] Secret `NPM_TOKEN` creado (token con 2FA: no sirve en CI → EOTP)
- [ ] Primer publish `0.1.0` local con OTP manual (3 comandos, orden: x64 → arm64 → wrapper)
- [ ] Conectar Trusted Publisher en npmjs.com (los 3 paquetes → repo + workflow `npm-platform.yml`)
- [ ] Borrar secret `NPM_TOKEN` y taggear `npm-v0.2.0` para verificar publish 100% OIDC

## [0.1.0] — base

- [x] TUI Ratatui: 7 tabs ecosistema, split lista/detail/journal, `s/t/r/e/d`, `/` filtro, `f` follow
- [x] Lectura por D-Bus `ListUnits` con fallback `systemctl`
- [x] Wrapper npm `katanakit-sysli` + paquetes `@senseikatana/ksys-linux-*`
- [x] Workflow `npm-platform.yml` (build matrix + publish con provenance)
