#!/usr/bin/env bash
# Level 2 test: real systemd in a privileged container.
# Nothing is installed on your machine; the container is removed afterwards.
# Read-only checks only (list/status/profiles) — no profile is applied.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NAME=ksys-test-systemd

echo "== pack =="
rm -f /tmp/katanakit-sysli-*.tgz
npm pack ./npm --pack-destination /tmp >/dev/null
TARBALL=$(ls /tmp/katanakit-sysli-*.tgz)

echo "== build image =="
docker build -f docker/test-systemd/Dockerfile -t ksys-test-systemd docker/test-systemd

echo "== boot systemd (privileged) =="
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --privileged --cgroupns=host \
  -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  --tmpfs /run --tmpfs /run/lock \
  ksys-test-systemd >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT

echo "== wait for systemd =="
for i in $(seq 1 30); do
  if docker exec "$NAME" systemctl is-system-running 2>/dev/null | grep -qE 'running|degraded'; then
    break
  fi
  sleep 2
done
docker exec "$NAME" systemctl is-system-running || true

echo "== install ksys from tarball =="
docker cp "$TARBALL" "$NAME:/tmp/ksys.tgz"
docker exec "$NAME" npm i -g /tmp/ksys.tgz
docker exec "$NAME" ksys --version

echo "== read-only checks against live systemd =="
docker exec "$NAME" ksys list --state running --type service | head -n 5
docker exec "$NAME" ksys status systemd-journald.service || true
docker exec "$NAME" ksys profiles
docker exec "$NAME" sh -c 'ksys profile no-power; echo "refused without --yes: exit $?"'
echo "ALL SYSTEMD CHECKS DONE (container will be removed)"
