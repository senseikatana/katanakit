use crate::systemd::{self, Scope};
use anyhow::Result;

/// Un paso: una accion systemctl sobre una unit en un ambito.
/// Equivale a una linea de tus recetas (ej. `systemctl mask upower`).
#[derive(Debug, Clone)]
pub struct Step {
    pub action: &'static str,
    pub scope: Scope,
    pub unit: &'static str,
}

/// Un perfil built-in: receta versionada y probada.
/// Se agregan con PR al repo, no con config (decision documentada en README).
#[derive(Debug, Clone)]
pub struct Profile {
    pub name: &'static str,
    pub title: &'static str,
    pub description: &'static str,
    pub steps: &'static [Step],
}

const NO_POWER: &[Step] = &[
    Step {
        action: "stop",
        scope: Scope::System,
        unit: "upower",
    },
    Step {
        action: "disable",
        scope: Scope::System,
        unit: "upower",
    },
    Step {
        action: "mask",
        scope: Scope::System,
        unit: "upower",
    },
    Step {
        action: "stop",
        scope: Scope::System,
        unit: "power-profiles-daemon",
    },
    Step {
        action: "disable",
        scope: Scope::System,
        unit: "power-profiles-daemon",
    },
    Step {
        action: "mask",
        scope: Scope::System,
        unit: "power-profiles-daemon",
    },
];

const NO_MODEM: &[Step] = &[
    Step {
        action: "stop",
        scope: Scope::System,
        unit: "ModemManager",
    },
    Step {
        action: "disable",
        scope: Scope::System,
        unit: "ModemManager",
    },
    Step {
        action: "mask",
        scope: Scope::System,
        unit: "ModemManager",
    },
    Step {
        action: "stop",
        scope: Scope::System,
        unit: "switcheroo-control",
    },
    Step {
        action: "disable",
        scope: Scope::System,
        unit: "switcheroo-control",
    },
    Step {
        action: "mask",
        scope: Scope::System,
        unit: "switcheroo-control",
    },
    Step {
        action: "stop",
        scope: Scope::System,
        unit: "bolt",
    },
    Step {
        action: "disable",
        scope: Scope::System,
        unit: "bolt",
    },
    Step {
        action: "mask",
        scope: Scope::System,
        unit: "bolt",
    },
];

const PRINT_ON_DEMAND: &[Step] = &[
    // Impresion a demanda: servicios apagados, el socket los levanta solo al imprimir.
    Step {
        action: "stop",
        scope: Scope::System,
        unit: "cups-browsed",
    },
    Step {
        action: "disable",
        scope: Scope::System,
        unit: "cups-browsed",
    },
    Step {
        action: "stop",
        scope: Scope::System,
        unit: "cups.service",
    },
    Step {
        action: "disable",
        scope: Scope::System,
        unit: "cups.service",
    },
    Step {
        action: "enable",
        scope: Scope::System,
        unit: "cups.socket",
    },
    Step {
        action: "start",
        scope: Scope::System,
        unit: "cups.socket",
    },
];

const NO_SSH_A11Y: &[Step] = &[
    // SSH y accesibilidad: solo existen en el bus de USUARIO.
    Step {
        action: "stop",
        scope: Scope::User,
        unit: "gcr-ssh-agent.service",
    },
    Step {
        action: "mask",
        scope: Scope::User,
        unit: "gcr-ssh-agent.service",
    },
    Step {
        action: "stop",
        scope: Scope::User,
        unit: "gcr-ssh-agent.socket",
    },
    Step {
        action: "mask",
        scope: Scope::User,
        unit: "gcr-ssh-agent.socket",
    },
    Step {
        action: "stop",
        scope: Scope::User,
        unit: "at-spi-dbus-bus",
    },
    Step {
        action: "mask",
        scope: Scope::User,
        unit: "at-spi-dbus-bus",
    },
];

const PROFILES: &[Profile] = &[
    Profile {
        name: "no-power",
        title: "Apagar stack de energia",
        description: "stop+disable+mask upower y power-profiles-daemon (system)",
        steps: NO_POWER,
    },
    Profile {
        name: "no-modem",
        title: "Apagar modems, graficos hibridos y thunderbolt",
        description: "stop+disable+mask ModemManager, switcheroo-control y bolt (system)",
        steps: NO_MODEM,
    },
    Profile {
        name: "print-on-demand",
        title: "Impresion a demanda",
        description: "apaga cups y deja cups.socket para activar al imprimir (system)",
        steps: PRINT_ON_DEMAND,
    },
    Profile {
        name: "no-ssh-a11y",
        title: "Apagar SSH agent y accesibilidad",
        description: "stop+mask gcr-ssh-agent y at-spi (ambito user)",
        steps: NO_SSH_A11Y,
    },
];

pub fn all() -> Vec<Profile> {
    PROFILES.to_vec()
}

pub fn find(name: &str) -> Option<Profile> {
    PROFILES.iter().find(|p| p.name == name).cloned()
}

/// Resultado por paso: para reportar en TUI/CLI sin cortar al primer error.
/// Un perfil sigue aunque un paso falle (ej. unit ya enmascarada).
#[derive(Debug, Clone)]
pub struct StepResult {
    pub step: Step,
    pub ok: bool,
    pub message: String,
}

pub async fn apply(profile: &Profile) -> Result<Vec<StepResult>> {
    let mut out = vec![];
    for step in profile.steps {
        match systemd::run_action(step.action, step.scope, step.unit).await {
            Ok(_) => out.push(StepResult {
                step: step.clone(),
                ok: true,
                message: "ok".to_string(),
            }),
            Err(e) => out.push(StepResult {
                step: step.clone(),
                ok: false,
                message: format!("{e:#}"),
            }),
        }
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn profiles_tienen_pasos_y_nombres_unicos() {
        let all = all();
        assert_eq!(all.len(), 4);
        for p in &all {
            assert!(!p.steps.is_empty(), "perfil {} sin pasos", p.name);
        }
        let mut names: Vec<_> = all.iter().map(|p| p.name).collect();
        names.sort_unstable();
        names.dedup();
        assert_eq!(names.len(), 4);
    }

    #[test]
    fn find_devuelve_los_cuatro() {
        for n in ["no-power", "no-modem", "print-on-demand", "no-ssh-a11y"] {
            assert!(find(n).is_some(), "falta perfil {n}");
        }
        assert!(find("no-existe").is_none());
    }

    #[test]
    fn no_ssh_a11y_es_todo_user() {
        let p = find("no-ssh-a11y").unwrap();
        assert!(p.steps.iter().all(|s| s.scope == Scope::User));
    }

    #[test]
    fn print_on_demand_termina_con_socket_activo() {
        let p = find("print-on-demand").unwrap();
        let last = p.steps.last().unwrap();
        assert_eq!(last.unit, "cups.socket");
        assert_eq!(last.action, "start");
    }
}
