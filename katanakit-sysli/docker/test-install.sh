#!/usr/bin/env bash
# Level 1 test: pack the single npm package, install it in a clean
# node:slim container (nothing touches your machine), run checks.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "== pack =="
rm -f /tmp/katanakit-sysli.tgz
npm pack ./npm --pack-destination /tmp >/dev/null
cp /tmp/katanakit-sysli-*.tgz docker/test-install/katanakit-sysli.tgz
echo "== build =="
docker build -f docker/test-install/Dockerfile \
  --build-arg TARBALL=katanakit-sysli.tgz \
  -t ksys-test-install docker/test-install
rm -f docker/test-install/katanakit-sysli.tgz
echo "== run =="
docker run --rm ksys-test-install
