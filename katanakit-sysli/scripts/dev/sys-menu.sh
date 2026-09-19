#!/usr/bin/env bash
# Menu gum de ksys: usa el CLI `ksys` como unica fuente de verdad.
# Si no hay binario compilado, cae a systemctl directo (mismas acciones).
# Requiere: gum, systemctl, journalctl. BigLinux/Arch/Deb/Fedora.
set -euo pipefail

# Binario ksys: instalado, release local o debug local (en ese orden).
KSYS=""
for c in ksys "$(dirname "$0")/../../target/release/ksys" "$(dirname "$0")/../../target/debug/ksys"; do
  if [ -x "$c" ]; then KSYS="$c"; break; fi
done

SCOPE="" # "" = system, "--user" = user
scope_flag() { [ -n "$SCOPE" ] && echo "--user" || echo ""; }

pick_area() {
  local label="ksys — ecosistema systemd [$([ -n "$SCOPE" ] && echo user || echo system)]"
  gum choose --header "$label" \
    "services" "running" "timers" "perfiles" "daemon-reload" "scope" \
    "logs" "boot" "network" "sessions" "salir"
}

pick_service() {
  # shellcheck disable=SC2086
  systemctl list-units --type=service --all --no-legend --no-pager $SCOPE \
    | awk '{print $1}' | gum filter --placeholder "fuzzy: nginx..."
}

run_action() {
  # $1=accion $2=unit — via ksys CLI si existe, si no systemctl directo.
  local act="$1" unit="$2" flag
  flag=$(scope_flag)
  gum confirm "¿$act $unit $([ -n "$flag" ] && echo '[user]')? (polkit pedira auth)" || return 0
  if [ -n "$KSYS" ]; then
    # shellcheck disable=SC2086
    "$KSYS" "$act" $flag "$unit"
  else
    # shellcheck disable=SC2086
    systemctl "$act" $flag "$unit"
  fi
}

service_action() {
  local unit="$1" act
  act=$(gum choose --header "$unit" \
    "status" "start" "stop" "restart" "enable" "disable" "mask" "unmask" "logs" "volver")
  case "$act" in
    status)
      if [ -n "$KSYS" ]; then "$KSYS" status $(scope_flag) "$unit"; else systemctl status $(scope_flag) "$unit" --no-pager || true; fi ;;
    logs)
      echo "== journalctl -f -u $unit (Ctrl+C para volver) =="
      journalctl -f $(scope_flag) -u "$unit" --no-pager -n 50 || true ;;
    volver) return 0 ;;
    *) run_action "$act" "$unit" ;;
  esac
  gum confirm "¿volver al menu?" || exit 0
}

run_profile() {
  local name="$1" desc="$2"
  gum confirm "¿Aplicar perfil '$name'? $desc" || return 0
  if [ -n "$KSYS" ]; then
    "$KSYS" profile "$name" --yes
  else
    echo "sin binario ksys: compila con cargo build --release"
    return 0
  fi
  gum confirm "¿volver al menu?" || exit 0
}

pick_profile() {
  local p
  if [ -n "$KSYS" ]; then
    p=$("$KSYS" profiles | grep -v '^ ' | awk '{print $1}' | gum choose --header "perfil built-in") || return 0
  else
    p=$(gum choose --header "perfil built-in" \
      "no-power" "no-modem" "print-on-demand" "no-ssh-a11y") || return 0
  fi
  case "$p" in
    no-power) run_profile "$p" "stop+disable+mask upower y power-profiles-daemon" ;;
    no-modem) run_profile "$p" "stop+disable+mask ModemManager, switcheroo-control y bolt" ;;
    print-on-demand) run_profile "$p" "apaga cups, deja cups.socket a demanda" ;;
    no-ssh-a11y) run_profile "$p" "stop+mask gcr-ssh-agent y at-spi (user)" ;;
  esac
}

main() {
  while true; do
    area=$(pick_area)
    case "$area" in
      services)
        unit=$(pick_service); [ -n "$unit" ] && service_action "$unit" ;;
      running)
        # shellcheck disable=SC2086
        if [ -n "$KSYS" ]; then "$KSYS" list $(scope_flag) --state running --type service | less;
        else systemctl list-units --type=service --state=running --no-pager $SCOPE | less; fi ;;
      timers) systemctl list-timers --no-pager $SCOPE || true; read -rp "Enter..." _ ;;
      perfiles) pick_profile ;;
      daemon-reload)
        gum confirm "¿daemon-reload $([ -n "$SCOPE" ] && echo '[user]')?" || continue
        if [ -n "$KSYS" ]; then "$KSYS" daemon-reload $(scope_flag); else systemctl daemon-reload $SCOPE; fi
        read -rp "Enter..." _ ;;
      scope)
        if [ -z "$SCOPE" ]; then SCOPE="--user"; else SCOPE=""; fi ;;
      logs) journalctl --no-pager -n 100 -p info || true; read -rp "Enter..." _ ;;
      boot) journalctl -b --no-pager -n 80 || true; bootctl status || true; read -rp "Enter..." _ ;;
      network) networkctl status || true; read -rp "Enter..." _ ;;
      sessions) loginctl list-sessions || true; read -rp "Enter..." _ ;;
      salir|*) exit 0 ;;
    esac
  done
}
main "$@"
