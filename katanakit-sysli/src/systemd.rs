use anyhow::{Context, Result};
use tokio::process::Command;

/// Ámbito systemd: manager del sistema (PID 1) o de la sesión del usuario.
/// El bus de usuario es obligatorio para units como gcr-ssh-agent o at-spi,
/// que NO existen en el system bus.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Scope {
    #[default]
    System,
    User,
}

impl Scope {
    pub fn label(&self) -> &'static str {
        match self {
            Scope::System => "system",
            Scope::User => "user",
        }
    }

    /// Flag extra para systemctl/journalctl. Vacío en system.
    fn flag(&self) -> &[&str] {
        match self {
            Scope::System => &[],
            Scope::User => &["--user"],
        }
    }

    async fn bus_connection(&self) -> Result<zbus::Connection> {
        match self {
            Scope::System => zbus::Connection::system()
                .await
                .context("sin system bus (¿systemd corriendo?)"),
            Scope::User => zbus::Connection::session()
                .await
                .context("sin session bus (¿sesión de usuario sin systemd?)"),
        }
    }
}

/// Info minima de una unit systemd (lo que devuelve ListUnits por D-Bus).
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct UnitInfo {
    pub name: String,
    pub description: String,
    pub load_state: String,
    pub active_state: String,
    pub sub_state: String,
}

type DbusUnitRow = (
    String,
    String,
    String,
    String,
    String,
    String,
    String,
    u32,
    String,
    String,
);

/// Lista units por D-Bus: org.freedesktop.systemd1.Manager.ListUnits
/// Funciona en BigLinux/Arch/Deb/Fedora igual: mismo bus, misma interfaz.
/// `state` filtra por ActiveState (ej. "running" = LISTAR SERVICIOS ACTIVOS).
pub async fn list_units(scope: Scope, kind: &str, state: Option<&str>) -> Result<Vec<UnitInfo>> {
    let conn = scope.bus_connection().await?;
    let proxy = zbus::Proxy::new(
        &conn,
        "org.freedesktop.systemd1",
        "/org/freedesktop/systemd1",
        "org.freedesktop.systemd1.Manager",
    )
    .await?;
    let rows: Vec<DbusUnitRow> = proxy.call("ListUnits", &()).await?;
    let mut out: Vec<UnitInfo> = rows
        .into_iter()
        .filter(|r| kind.is_empty() || r.0.ends_with(&format!(".{kind}")) || kind == "all")
        .filter(|r| state.is_none_or(|s| r.3 == s))
        .map(|r| UnitInfo {
            name: r.0,
            description: r.1,
            load_state: r.2,
            active_state: r.3,
            sub_state: r.4,
        })
        .collect();
    out.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(out)
}

/// Fallback cuando no hay D-Bus (containers sin systemd): parsea systemctl.
pub async fn list_units_fallback(
    scope: Scope,
    kind: &str,
    state: Option<&str>,
) -> Result<Vec<UnitInfo>> {
    let type_arg = format!("--type={kind}");
    let state_arg = state.map(|s| format!("--state={s}"));
    let mut cmd_args: Vec<&str> = vec![
        "list-units",
        &type_arg,
        "--all",
        "--no-legend",
        "--no-pager",
    ];
    cmd_args.extend(scope.flag());
    let mut owned: Vec<String> = vec![];
    if let Some(sa) = &state_arg {
        owned.push(sa.clone());
    }
    for o in &owned {
        cmd_args.push(o.as_str());
    }
    let out = Command::new("systemctl").args(&cmd_args).output().await?;
    let text = String::from_utf8_lossy(&out.stdout);
    let mut v = vec![];
    for line in text.lines() {
        let mut parts = line.split_whitespace();
        let (Some(name), Some(_load), Some(active), Some(sub)) =
            (parts.next(), parts.next(), parts.next(), parts.next())
        else {
            continue;
        };
        v.push(UnitInfo {
            name: name.to_string(),
            description: line.to_string(),
            load_state: String::new(),
            active_state: active.to_string(),
            sub_state: sub.to_string(),
        });
    }
    Ok(v)
}

pub async fn show_unit(scope: Scope, unit: &str) -> Result<String> {
    // systemctl acepta flags despues del verbo: `systemctl show --user --no-pager foo`
    let mut ordered: Vec<&str> = vec!["show"];
    ordered.extend(scope.flag());
    ordered.extend(["--no-pager", unit]);
    let out = Command::new("systemctl").args(&ordered).output().await?;
    Ok(String::from_utf8_lossy(&out.stdout)
        .lines()
        .filter(|l| {
            l.starts_with("Description=")
                || l.starts_with("ActiveState=")
                || l.starts_with("SubState=")
                || l.starts_with("ExecMainStartTimestamp=")
                || l.starts_with("FragmentPath=")
        })
        .collect::<Vec<_>>()
        .join("\n"))
}

/// Ejecuta accion con systemctl (polkit pide auth solo por esa accion).
/// A proposito NO usamos sudo: dejamos que polkit decida. Asi evitamos sudo total.
/// Acciones: start stop restart enable disable mask unmask.
pub async fn run_action(action: &str, scope: Scope, unit: &str) -> Result<String> {
    let sys_action = match action {
        "start" | "stop" | "restart" | "enable" | "disable" | "mask" | "unmask" => action,
        _ => anyhow::bail!("accion desconocida: {action}"),
    };
    let mut ordered: Vec<&str> = vec![sys_action];
    ordered.extend(scope.flag());
    ordered.push(unit);
    // systemctl acepta flags despues del verbo: `systemctl stop --user foo`
    let out = Command::new("systemctl").args(&ordered).output().await?;
    if out.status.success() {
        Ok(String::from_utf8_lossy(&out.stdout).to_string()
            + String::from_utf8_lossy(&out.stderr).as_ref())
    } else {
        anyhow::bail!(
            "{}",
            String::from_utf8_lossy(&out.stderr)
                .lines()
                .next()
                .unwrap_or("systemctl fallo")
        );
    }
}

/// REINICIAR SYSTEMD: recarga los ficheros de units (daemon-reload).
pub async fn daemon_reload(scope: Scope) -> Result<String> {
    let mut ordered: Vec<&str> = vec!["daemon-reload"];
    ordered.extend(scope.flag());
    let out = Command::new("systemctl").args(&ordered).output().await?;
    if out.status.success() {
        Ok(format!("daemon-reload ok ({})", scope.label()))
    } else {
        anyhow::bail!(
            "{}",
            String::from_utf8_lossy(&out.stderr)
                .lines()
                .next()
                .unwrap_or("daemon-reload fallo")
        );
    }
}

/// Helpers para perfiles/funciones: estado actual sin parsear texto a mano.
pub async fn is_active(scope: Scope, unit: &str) -> bool {
    let mut ordered: Vec<&str> = vec!["is-active", "--quiet"];
    ordered.extend(scope.flag());
    ordered.push(unit);
    Command::new("systemctl")
        .args(&ordered)
        .status()
        .await
        .map(|s| s.success())
        .unwrap_or(false)
}

pub async fn is_enabled(scope: Scope, unit: &str) -> bool {
    let mut ordered: Vec<&str> = vec!["is-enabled", "--quiet"];
    ordered.extend(scope.flag());
    ordered.push(unit);
    Command::new("systemctl")
        .args(&ordered)
        .status()
        .await
        .map(|s| s.success())
        .unwrap_or(false)
}
