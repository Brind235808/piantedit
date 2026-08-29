use chrono::Local;
use serde::{Deserialize, Serialize};
use std::{fs, path::{Path, PathBuf}};
mod dds;

#[derive(Debug, Serialize)]
struct BackupResult { backup_path: String }

#[derive(Debug, Deserialize)]
struct SaveRequest { project_path: String, content: String }

fn backup_path(project: &Path) -> PathBuf {
    let dir = project.parent().unwrap_or_else(|| Path::new(".")) .join(".backup");
    let stem = project.file_name().and_then(|s| s.to_str()).unwrap_or("project.puzzle");
    dir.join(format!("{}-{}.bak", stem, Local::now().format("%Y%m%d-%H%M%S")))
}

#[tauri::command]
fn save_project(request: SaveRequest) -> Result<BackupResult, String> {
    let project = PathBuf::from(&request.project_path);
    if project.exists() {
        let backup = backup_path(&project);
        if let Some(parent) = backup.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
        fs::copy(&project, &backup).map_err(|e| e.to_string())?;
        fs::write(&project, request.content).map_err(|e| e.to_string())?;
        return Ok(BackupResult { backup_path: backup.to_string_lossy().to_string() });
    }
    fs::write(&project, request.content).map_err(|e| e.to_string())?;
    Ok(BackupResult { backup_path: String::new() })
}

#[tauri::command]
fn inspect_file(path: String) -> Result<serde_json::Value, String> {
    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"path": path, "bytes": metadata.len()}))
}

#[tauri::command]
fn inspect_dds(path: String) -> Result<dds::DdsInfo, String> {
    let bytes = fs::read(&path).map_err(|e| e.to_string())?;
    dds::parse(&bytes)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![save_project, inspect_file, inspect_dds])
        .run(tauri::generate_context!())
        .expect("error while running PiantEdit");
}

fn main() { run(); }
