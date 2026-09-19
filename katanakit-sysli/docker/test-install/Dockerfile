# Level 1 — install path only (NO systemd inside).
# Verifies: tarball layout, launcher arch detection, graceful
# degradation without a system bus. The ksys TUI itself needs
# real systemd: see ../test-systemd.
FROM node:20-slim
ARG TARBALL=katanakit-sysli.tgz
COPY ${TARBALL} /tmp/ksys.tgz
RUN npm i -g /tmp/ksys.tgz && rm /tmp/ksys.tgz && ksys --version
# Default run: version + help + expected graceful failure on list.
CMD ["sh", "-c", "ksys --help && echo '--- list without systemd (must fail gracefully) ---' && (ksys list --state running || true)"]
