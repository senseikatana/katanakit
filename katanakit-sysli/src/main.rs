mod app;
mod journal;
mod profiles;
mod systemd;
mod ui;

use anyhow::Result;
use app::{App, Tab};
use clap::{Parser, Subcommand};
use crossterm::{
    event::{self, Event, KeyCode, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{backend::CrosstermBackend, Terminal};
use std::{io, time::Duration};
use systemd::Scope;

#[derive(Parser, Debug)]
#[command(
    name = "ksys",
    bin_name = "ksys",
    version,
    about = "lazysystemd: ecosistema systemd en TUI (sin sudo total)"
)]
struct Cli {
    /// Tipo inicial del TUI: service, timer, socket...
    #[arg(long, default_value = "service")]
    kind: String,
    /// Alcance inicial del TUI: system o user.
    #[arg(long, default_value = "system")]
    scope: String,
    #[command(subcommand)]
    command: Option<Commands>,
}

/// Subcomandos = "las funciones": todo lo que el TUI hace, scripteable.
/// Lo que no entra al TUI (gum, shell) usa estos mismos comandos.
#[derive(Subcommand, Debug)]
enum Commands {
    /// LISTAR SERVICIOS (activos con --state running).
    List {
        #[arg(long)]
        user: bool,
        #[arg(long, default_value = "service")]
        type_: String,
        #[arg(long)]
        state: Option<String>,
    },
    Start {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    Stop {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    Restart {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    Enable {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    Disable {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    Mask {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    Unmask {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    /// Estado de una unit (active/enabled) sin parsear texto.
    Status {
        unit: String,
        #[arg(long)]
        user: bool,
    },
    /// REINICIAR SYSTEMD (daemon-reload).
    DaemonReload {
        #[arg(long)]
        user: bool,
    },
    /// Aplica un perfil built-in (requiere --yes, son acciones destructivas).
    Profile {
        name: String,
        #[arg(long)]
        yes: bool,
    },
    /// Lista los perfiles disponibles.
    Profiles,
}

fn scope_of(user: bool) -> Scope {
    if user {
        Scope::User
    } else {
        Scope::System
    }
}

async fn headless_action(action: &str, user: bool, unit: &str) -> Result<()> {
    let out = systemd::run_action(action, scope_of(user), unit).await?;
    let first = out.lines().next().unwrap_or("");
    if !first.is_empty() {
        println!("{first}");
    }
    println!("ok {action} {unit}");
    Ok(())
}

async fn run_headless(cmd: Commands) -> Result<()> {
    match cmd {
        Commands::List { user, type_, state } => {
            let scope = scope_of(user);
            let units = match systemd::list_units(scope, &type_, state.as_deref()).await {
                Ok(u) => u,
                Err(_) => systemd::list_units_fallback(scope, &type_, state.as_deref()).await?,
            };
            for u in units {
                println!(
                    "{:<50} {:<10} {:<10} {}",
                    u.name, u.active_state, u.sub_state, u.description
                );
            }
        }
        Commands::Start { unit, user } => headless_action("start", user, &unit).await?,
        Commands::Stop { unit, user } => headless_action("stop", user, &unit).await?,
        Commands::Restart { unit, user } => headless_action("restart", user, &unit).await?,
        Commands::Enable { unit, user } => headless_action("enable", user, &unit).await?,
        Commands::Disable { unit, user } => headless_action("disable", user, &unit).await?,
        Commands::Mask { unit, user } => headless_action("mask", user, &unit).await?,
        Commands::Unmask { unit, user } => headless_action("unmask", user, &unit).await?,
        Commands::Status { unit, user } => {
            let scope = scope_of(user);
            let active = systemd::is_active(scope, &unit).await;
            let enabled = systemd::is_enabled(scope, &unit).await;
            println!(
                "{} [{}]: active={} enabled={}",
                unit,
                scope.label(),
                active,
                enabled
            );
        }
        Commands::DaemonReload { user } => {
            println!("{}", systemd::daemon_reload(scope_of(user)).await?);
        }
        Commands::Profile { name, yes } => {
            let Some(profile) = profiles::find(&name) else {
                anyhow::bail!("perfil desconocido: {name}. Ver: ksys profiles");
            };
            if !yes {
                anyhow::bail!(
                    "el perfil '{}' ejecuta {} pasos (algunos destructivos). Reconfirma con --yes.",
                    name,
                    profile.steps.len()
                );
            }
            let report = profiles::apply(&profile).await?;
            let mut failed = 0;
            for r in &report {
                let scope = r.step.scope.label();
                if r.ok {
                    println!("ok   {} {} [{}]", r.step.action, r.step.unit, scope);
                } else {
                    failed += 1;
                    println!(
                        "FAIL {} {} [{}]: {}",
                        r.step.action, r.step.unit, scope, r.message
                    );
                }
            }
            println!(
                "perfil '{}': {}/{} pasos ok",
                name,
                report.len() - failed,
                report.len()
            );
            if failed > 0 {
                anyhow::bail!("{failed} pasos fallaron");
            }
        }
        Commands::Profiles => {
            for p in profiles::all() {
                println!("{:<16} {} [{} pasos]", p.name, p.title, p.steps.len());
                println!("{:<16} {}", "", p.description);
            }
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Con subcomando: modo funcion (sin TUI). Sin subcomando: TUI.
    if let Some(cmd) = cli.command {
        run_headless(cmd).await?;
        return Ok(());
    }

    let mut app = App::new();
    if cli.kind == "timer" {
        app.active_tab = Tab::Timers;
    }
    if cli.scope == "user" {
        app.scope = Scope::User;
    }
    app.refresh_units().await;

    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let res = run(&mut terminal, &mut app).await;

    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;

    if let Err(e) = res {
        eprintln!("ksys error: {e:#}");
    }
    Ok(())
}

async fn run<B: ratatui::backend::Backend>(
    terminal: &mut Terminal<B>,
    app: &mut App,
) -> Result<()> {
    loop {
        terminal.draw(|f| ui::draw(f, app))?;

        if event::poll(Duration::from_millis(200))? {
            if let Event::Key(key) = event::read()? {
                // Perfil confirmado esperando y/n
                if let Some(name) = app.pending_profile.clone() {
                    match key.code {
                        KeyCode::Char('y') | KeyCode::Char('Y') => {
                            app.pending_profile = None;
                            app.execute_profile(&name).await;
                        }
                        KeyCode::Char('n') | KeyCode::Char('N') | KeyCode::Esc => {
                            app.pending_profile = None;
                            app.status = "perfil cancelado".to_string();
                        }
                        _ => {}
                    }
                    continue;
                }
                // Confirm de accion simple esperando y/n
                if app.confirm.is_some() {
                    match key.code {
                        KeyCode::Char('y') | KeyCode::Char('Y') => {
                            let action = app.confirm.take();
                            if let Some(a) = action {
                                app.execute_pending(a).await;
                            }
                        }
                        KeyCode::Char('n') | KeyCode::Char('N') | KeyCode::Esc => {
                            app.confirm = None;
                            app.status = "cancelado".to_string();
                        }
                        _ => {}
                    }
                    continue;
                }
                // Picker de perfiles abierto: j/k + Enter/Esc
                if app.profile_picker.is_some() {
                    match key.code {
                        KeyCode::Down | KeyCode::Char('j') => app.profile_next(),
                        KeyCode::Up | KeyCode::Char('k') => app.profile_prev(),
                        KeyCode::Enter => app.confirm_profile(),
                        KeyCode::Esc | KeyCode::Char('q') | KeyCode::Char('P') => {
                            app.close_profiles()
                        }
                        _ => {}
                    }
                    continue;
                }
                match key.code {
                    KeyCode::Char('q') | KeyCode::Esc => return Ok(()),
                    KeyCode::Char('c') if key.modifiers.contains(KeyModifiers::CONTROL) => {
                        return Ok(())
                    }
                    KeyCode::Down | KeyCode::Char('j') => {
                        app.select_next();
                        app.load_detail().await;
                    }
                    KeyCode::Up | KeyCode::Char('k') => {
                        app.select_prev();
                        app.load_detail().await;
                    }
                    KeyCode::Tab => {
                        app.next_tab();
                        app.refresh_units().await;
                    }
                    KeyCode::BackTab => {
                        app.prev_tab();
                        app.refresh_units().await;
                    }
                    KeyCode::Char('1') => app.set_tab(Tab::Units),
                    KeyCode::Char('2') => app.set_tab(Tab::Timers),
                    KeyCode::Char('3') => app.set_tab(Tab::Journal),
                    KeyCode::Char('4') => app.set_tab(Tab::Boot),
                    KeyCode::Char('5') => app.set_tab(Tab::Network),
                    KeyCode::Char('6') => app.set_tab(Tab::Sessions),
                    KeyCode::Char('7') => app.set_tab(Tab::Devices),
                    KeyCode::Char('/') => app.toggle_filter_input(),
                    KeyCode::Enter => {
                        if app.filtering {
                            app.apply_filter_and_close().await;
                        }
                    }
                    KeyCode::Char(c) if app.filtering => app.push_filter(c),
                    KeyCode::Backspace if app.filtering => app.pop_filter(),
                    // Acciones estilo lazygit (+ mask/unmask)
                    KeyCode::Char('s') => app.request_action("start").await,
                    KeyCode::Char('t') => app.request_action("stop").await,
                    KeyCode::Char('r') => app.request_action("restart").await,
                    KeyCode::Char('e') => app.request_action("enable").await,
                    KeyCode::Char('d') => app.request_action("disable").await,
                    KeyCode::Char('m') => app.request_action("mask").await,
                    KeyCode::Char('M') => app.request_action("unmask").await,
                    // U alterna system/user, R daemon-reload, P perfiles
                    KeyCode::Char('U') => app.toggle_scope().await,
                    KeyCode::Char('R') => app.request_reload(),
                    KeyCode::Char('P') => app.open_profiles(),
                    KeyCode::Char('f') => app.toggle_follow().await,
                    _ => {}
                }
            }
        }
        // Poll liviano del journal si follow esta activo
        app.maybe_poll_follow().await;
    }
}
