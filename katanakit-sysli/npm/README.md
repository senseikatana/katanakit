# `katanakit-sysli` — ksys

lazygit for the **whole systemd ecosystem**: units, timers, journal, boot,
network, sessions, devices — in one terminal UI. No full sudo: polkit
authenticates per action, only when you confirm one.

```bash
npm i -g katanakit-sysli
ksys
```

Requires **Linux + systemd**. Both binaries (x64, arm64) ship inside this
single package — no downloads at install time.

Quick start: `j/k` move · `s/t/r/e/d/m/M` act (asks `y/n`) · `U` system/user scope ·
`R` daemon-reload · `P` built-in profiles · `q` quit. Full guide with CLI
cookbook, profiles and troubleshooting:
https://github.com/senseikatana/katanakit-sysli
