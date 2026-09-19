use crate::{
    app::{App, Tab},
    profiles,
};
use ratatui::{
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Clear, List, ListItem, Paragraph, Tabs},
    Frame,
};

fn state_color(active: &str, sub: &str) -> Color {
    match (active, sub) {
        ("active", "running") => Color::Green,
        ("active", _) => Color::LightGreen,
        ("failed", _) => Color::Red,
        ("inactive", "dead") => Color::DarkGray,
        ("activating", _) => Color::Yellow,
        _ => Color::White,
    }
}

pub fn draw(f: &mut Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Min(8),
            Constraint::Length(3),
        ])
        .split(f.area());

    // Tabs = ecosistema de tu diagrama
    let titles: Vec<Line> = Tab::all()
        .iter()
        .map(|t| Line::from(Span::styled(t.title(), Style::default().fg(Color::White))))
        .collect();
    let idx = Tab::all()
        .iter()
        .position(|t| *t == app.active_tab)
        .unwrap_or(0);
    let tabs = Tabs::new(titles)
        .block(Block::default().borders(Borders::ALL).title(format!(
            "ksys [{}] · systemd como ecosistema",
            app.scope.label()
        )))
        .select(idx)
        .style(Style::default().fg(Color::Cyan))
        .highlight_style(
            Style::default()
                .fg(Color::Black)
                .bg(Color::Green)
                .add_modifier(Modifier::BOLD),
        );
    f.render_widget(tabs, chunks[0]);

    let mid = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(45), Constraint::Percentage(55)])
        .split(chunks[1]);

    // Izquierda: lista units
    let items: Vec<ListItem> = app
        .filtered
        .iter()
        .enumerate()
        .map(|(list_idx, unit_idx)| {
            let u = &app.units[*unit_idx];
            let dot = match u.active_state.as_str() {
                "active" => "●",
                "failed" => "✗",
                _ => "○",
            };
            let c = state_color(&u.active_state, &u.sub_state);
            let sel = list_idx == app.selected;
            let line = Line::from(vec![
                Span::styled(
                    format!("{dot} "),
                    Style::default().fg(c).add_modifier(Modifier::BOLD),
                ),
                Span::styled(
                    format!("{:<38} {:<10}", u.name, u.sub_state),
                    if sel {
                        Style::default().fg(Color::Black).bg(Color::Green)
                    } else {
                        Style::default().fg(Color::White)
                    },
                ),
            ]);
            ListItem::new(line)
        })
        .collect();
    let title_left = format!(
        "{} [{}] · filtro: {} (/)",
        app.active_tab.title(),
        app.scope.label(),
        if app.filter.is_empty() {
            "—"
        } else {
            &app.filter
        }
    );
    let list = List::new(items).block(Block::default().borders(Borders::ALL).title(title_left));
    f.render_widget(list, mid[0]);

    // Derecha: detail + journal
    let right = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Length(7), Constraint::Min(5)])
        .split(mid[1]);
    let detail = Paragraph::new(app.detail.clone()).block(
        Block::default()
            .borders(Borders::ALL)
            .title("detail · systemctl show"),
    );
    f.render_widget(detail, right[0]);

    let log_title = if app.follow {
        "journal · FOLLOW (f)"
    } else {
        "journal · journalctl (f=follow)"
    };
    let log = Paragraph::new(app.journal_lines.join("\n"))
        .block(Block::default().borders(Borders::ALL).title(log_title));
    f.render_widget(log, right[1]);

    // Footer: status + confirm (accion o perfil)
    let footer_text = if let Some(name) = &app.pending_profile {
        format!("⚠ aplicar perfil '{name}' ?  [y] si  [n] no   (polkit pedira auth por paso)")
    } else if let Some(p) = &app.confirm {
        if p.action == "daemon-reload" {
            format!("⚠ daemon-reload [{}] ?  [y] si  [n] no", p.scope.label())
        } else {
            format!(
                "⚠ {} {} [{}] ?  [y] si  [n] no   (polkit pedira auth solo por esta accion)",
                p.action,
                p.unit,
                p.scope.label()
            )
        }
    } else {
        app.status.clone()
    };
    let style = if app.confirm.is_some() || app.pending_profile.is_some() {
        Style::default().fg(Color::Black).bg(Color::Yellow)
    } else {
        Style::default().fg(Color::Green)
    };
    let footer = Paragraph::new(footer_text)
        .block(Block::default().borders(Borders::ALL))
        .style(style);
    f.render_widget(footer, chunks[2]);

    // Popup: picker de perfiles built-in
    if let Some(sel) = app.profile_picker {
        let area = centered_rect(60, 50, f.area());
        f.render_widget(Clear, area);
        let items: Vec<ListItem> = profiles::all()
            .iter()
            .enumerate()
            .map(|(i, p)| {
                let line = Line::from(vec![
                    Span::styled(
                        format!("{:<16}", p.name),
                        if i == sel {
                            Style::default()
                                .fg(Color::Black)
                                .bg(Color::Green)
                                .add_modifier(Modifier::BOLD)
                        } else {
                            Style::default()
                                .fg(Color::Green)
                                .add_modifier(Modifier::BOLD)
                        },
                    ),
                    Span::raw(format!(" {} [{} pasos]", p.title, p.steps.len())),
                ]);
                ListItem::new(line)
            })
            .collect();
        let picker = List::new(items).block(
            Block::default()
                .borders(Borders::ALL)
                .title("Perfiles · Enter aplicar · Esc cerrar"),
        );
        f.render_widget(picker, area);
    }
}

/// Rect centrado para popups (porcentaje del area).
fn centered_rect(percent_x: u16, percent_y: u16, r: Rect) -> Rect {
    let popup = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Percentage((100 - percent_y) / 2),
            Constraint::Percentage(percent_y),
            Constraint::Percentage((100 - percent_y) / 2),
        ])
        .split(r);
    Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage((100 - percent_x) / 2),
            Constraint::Percentage(percent_x),
            Constraint::Percentage((100 - percent_x) / 2),
        ])
        .split(popup[1])[1]
}
