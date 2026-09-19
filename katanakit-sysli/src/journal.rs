use crate::systemd::Scope;
use anyhow::Result;
use tokio::process::Command;

pub async fn tail_unit(scope: Scope, unit: &str, n: usize) -> Result<Vec<String>> {
    // Units de usuario viven en el journal de usuario: journalctl --user -u ...
    let n_str = n.to_string();
    let mut args: Vec<&str> = vec!["-u", unit, "-n", &n_str, "--no-pager"];
    if scope == Scope::User {
        args.push("--user");
    }
    run_cmd("journalctl", &args).await
}

pub async fn run_cmd(bin: &str, args: &[&str]) -> Result<Vec<String>> {
    let out = Command::new(bin).args(args).output().await?;
    let text = String::from_utf8_lossy(&out.stdout).to_string()
        + String::from_utf8_lossy(&out.stderr).as_ref();
    Ok(text.lines().map(|l| l.to_string()).collect())
}

pub async fn run_cmd_string(bin: &str, args: &[&str]) -> Result<String> {
    Ok(run_cmd(bin, args).await?.join("\n"))
}
