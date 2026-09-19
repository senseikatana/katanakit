#!/usr/bin/env node
// Keeps versions in sync: Cargo.toml == npm/package.json.
// (Platform dirs npm-linux-*/ are frozen at 0.1.0, deprecated since 0.2.0.)
//   node scripts/sync-version.cjs          -> writes the Cargo version into npm
//   node scripts/sync-version.cjs --check  -> verify only (for CI)
"use strict";

const { readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const MANIFESTS = ["npm/package.json"];

function cargoVersion() {
  const cargo = readFileSync(path.join(ROOT, "Cargo.toml"), "utf8");
  const m = cargo.match(/^version\s*=\s*"([^"]+)"/m);
  if (!m) throw new Error("no se encontró version en Cargo.toml");
  return m[1];
}

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

const checkOnly = process.argv.includes("--check");
const version = cargoVersion();
let dirty = false;

for (const rel of MANIFESTS) {
  const file = path.join(ROOT, rel);
  const json = readJson(file);
  const before = JSON.stringify(json);
  if (json.version !== version) {
    if (checkOnly) console.error(`DESYNC ${rel}: tiene ${json.version}, Cargo dice ${version}`);
    json.version = version;
  }
  if (JSON.stringify(json) !== before) {
    dirty = true;
    if (!checkOnly) {
      writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
      console.log(`sync ${rel} -> ${version}`);
    }
  }
}

if (checkOnly && dirty) {
  console.error("Corre: node scripts/sync-version.cjs");
  process.exit(1);
}
if (!dirty) console.log(`OK todas en ${version}`);
