# Level 2 — REAL systemd inside (Arch Linux).
# Boots systemd as PID 1, then the test script installs ksys and runs
# read-only checks (list/status/profiles) against the live manager.
FROM archlinux:base
RUN pacman -Syu --no-confirm --needed systemd nodejs npm dbus iproute2 \
  && pacman -Scc --no-confirm \
  && systemctl enable systemd-networkd.service \
  && echo 'root:root' | chpasswd
# Mask units that fail in containers to keep the boot clean.
RUN systemctl mask systemd-udev-trigger.service systemd-modules-load.service \
    dev-hugepages.mount sys-kernel-debug.mount 2>/dev/null || true
STOPSIGNAL SIGRTMIN+3
CMD ["/usr/lib/systemd/systemd"]
