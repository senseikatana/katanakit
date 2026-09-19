#!/usr/bin/env node
// ksys — single-package launcher for `katanakit-sysli`.
//
// Both prebuilt binaries ship inside this package:
//   bin/ksys-x64    Linux x86_64 (gnu)
//   bin/ksys-arm64  Linux arm64 (gnu)
// No postinstall downloads, no extra packages. The shim picks by arch and
// execs the Rust binary with your args and an inherited terminal.
//
// Local dev fallback: ../../target/release/ksys (or debug) when the
// bundled binary for your arch is missing.
"use strict";

const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const ARCH_TO_BIN = {
  x64: "ksys-x64",
  arm64: "ksys-arm64",
};

function fail(msg) {
  console.error(`ksys: ${msg}`);
  process.exit(1);
}

// 1. Linux only: ksys talks to systemd over D-Bus.
if (process.platform !== "linux") {
  fail(
    `requires Linux + systemd (you are on ${process.platform}). ` +
      `To build from source on Linux: cargo install --path .`
  );
}

// 2. Supported arch.
const file = ARCH_TO_BIN[process.arch];
if (!file) {
  fail(
    `unsupported architecture: ${process.arch}. ` +
      `Supported: ${Object.keys(ARCH_TO_BIN).join(", ")}. ` +
      `Alternative: cargo build --release.`
  );
}

// 3. Bundled binary, then local cargo build (dev).
let binary = path.join(__dirname, file);
if (!existsSync(binary)) {
  const candidates = [
    path.join(__dirname, "..", "..", "target", "release", "ksys"),
    path.join(__dirname, "..", "..", "target", "debug", "ksys"),
  ];
  binary = candidates.find((p) => existsSync(p)) || null;
}

if (!binary) {
  fail(
    `binary not found.\n` +
      `  - Installed via npm: reinstall with npm i -g katanakit-sysli\n` +
      `  - In this repo: run cargo build --release first`
  );
}

// 4. Heads-up when PID 1 is not systemd (containers without systemd...).
//    Non-blocking: the TUI falls back to systemctl, but we warn.
try {
  const fs = require("node:fs");
  const comm = fs.readFileSync("/proc/1/comm", "utf8").trim();
  if (comm !== "systemd" && !process.env.KSYS_ALLOW_NO_SYSTEMD) {
    console.error(
      `ksys: warning — PID 1 is "${comm}", not systemd. ` +
        `Some views will use a limited fallback.`
    );
  }
} catch {
  // No /proc (rare): carry on, the binary decides.
}

// 5. Exec with the same args and an inherited terminal.
const res = spawnSync(binary, process.argv.slice(2), { stdio: "inherit" });
process.exit(res.status ?? 1);
