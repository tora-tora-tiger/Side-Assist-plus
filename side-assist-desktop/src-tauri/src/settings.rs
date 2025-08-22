use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use lazy_static::lazy_static;
use tauri::{AppHandle, Manager};

// 設定の構造体
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    #[serde(rename = "hapticsEnabled")]
    pub haptics_enabled: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            haptics_enabled: true,
        }
    }
}

// グローバル設定状態
lazy_static! {
    pub static ref SETTINGS: Mutex<AppSettings> = Mutex::new(AppSettings::default());
}

// 設定ファイルのパスを取得
fn get_settings_path(app_handle: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let app_dir = app_handle.path().app_config_dir()
        .map_err(|e| format!("Failed to get app config directory: {}", e))?;
    
    // ディレクトリが存在しない場合は作成
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)?;
    }
    
    Ok(app_dir.join("settings.json"))
}

// 設定を読み込む
pub fn load_settings(app_handle: &AppHandle) -> Result<AppSettings, Box<dyn std::error::Error>> {
    let settings_path = get_settings_path(app_handle)?;
    
    if settings_path.exists() {
        let contents = fs::read_to_string(&settings_path)?;
        let settings: AppSettings = serde_json::from_str(&contents)?;
        
        // グローバル状態を更新
        if let Ok(mut global_settings) = SETTINGS.lock() {
            *global_settings = settings.clone();
        }
        
        println!("✅ [Settings] Loaded settings from: {:?}", settings_path);
        println!("📋 [Settings] Settings: {:?}", settings);
        Ok(settings)
    } else {
        let default_settings = AppSettings::default();
        save_settings(app_handle, &default_settings)?;
        
        // グローバル状態を更新
        if let Ok(mut global_settings) = SETTINGS.lock() {
            *global_settings = default_settings.clone();
        }
        
        println!("📝 [Settings] Created default settings at: {:?}", settings_path);
        Ok(default_settings)
    }
}

// 設定を保存する
pub fn save_settings(app_handle: &AppHandle, settings: &AppSettings) -> Result<(), Box<dyn std::error::Error>> {
    let settings_path = get_settings_path(app_handle)?;
    
    let json = serde_json::to_string_pretty(settings)?;
    fs::write(&settings_path, json)?;
    
    // グローバル状態を更新
    if let Ok(mut global_settings) = SETTINGS.lock() {
        *global_settings = settings.clone();
    }
    
    println!("💾 [Settings] Saved settings to: {:?}", settings_path);
    println!("📋 [Settings] Settings: {:?}", settings);
    Ok(())
}

// 現在の設定を取得
pub fn get_current_settings() -> AppSettings {
    match SETTINGS.lock() {
        Ok(settings) => settings.clone(),
        Err(_) => {
            println!("❌ [Settings] Failed to lock settings, using default");
            AppSettings::default()
        }
    }
}

// 設定を部分的に更新
pub fn update_settings(app_handle: &AppHandle, updates: serde_json::Value) -> Result<AppSettings, Box<dyn std::error::Error>> {
    let mut current_settings = get_current_settings();
    
    // 各フィールドを更新
    if let Some(haptics_enabled) = updates.get("hapticsEnabled").and_then(|v| v.as_bool()) {
        current_settings.haptics_enabled = haptics_enabled;
        println!("🔄 [Settings] Updated haptics_enabled: {}", haptics_enabled);
    }
    
    save_settings(app_handle, &current_settings)?;
    
    println!("✅ [Settings] Settings updated successfully");
    Ok(current_settings)
}

// 独立したパス取得（storage.rsのパターンに合わせて）
fn get_settings_file_path() -> Result<PathBuf, String> {
    let app_data_dir = if cfg!(target_os = "macos") {
        dirs::home_dir()
            .ok_or("Failed to get home directory")?
            .join("Library")
            .join("Application Support")
            .join("Side Assist Plus")
    } else if cfg!(target_os = "windows") {
        dirs::data_dir()
            .ok_or("Failed to get data directory")?
            .join("Side Assist Plus")
    } else {
        dirs::data_dir()
            .ok_or("Failed to get data directory")?
            .join("side-assist-plus")
    };

    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
        println!("📁 Created app data directory: {:?}", app_data_dir);
    }

    Ok(app_data_dir.join("settings.json"))
}

// 永続化対応の設定更新関数
pub fn update_settings_persistent(updates: serde_json::Value) -> Result<AppSettings, String> {
    let mut current_settings = get_current_settings();
    
    // 各フィールドを更新
    if let Some(haptics_enabled) = updates.get("hapticsEnabled").and_then(|v| v.as_bool()) {
        current_settings.haptics_enabled = haptics_enabled;
        println!("🔄 [Settings] Updated haptics_enabled: {}", haptics_enabled);
    }
    
    // ファイルに保存
    let file_path = get_settings_file_path()?;
    let json = serde_json::to_string_pretty(&current_settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(&file_path, json)
        .map_err(|e| format!("Failed to write settings to file: {}", e))?;
    
    // グローバル状態を更新
    if let Ok(mut global_settings) = SETTINGS.lock() {
        *global_settings = current_settings.clone();
    }
    
    println!("💾 [Settings] Saved settings to: {:?}", file_path);
    println!("✅ [Settings] Settings updated successfully");
    Ok(current_settings)
}

// 起動時の設定読み込み（独立版）
pub fn load_settings_persistent() -> Result<AppSettings, String> {
    let file_path = get_settings_file_path()?;
    
    if file_path.exists() {
        let contents = fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;
        
        let settings: AppSettings = serde_json::from_str(&contents)
            .map_err(|e| format!("Failed to parse settings file: {}", e))?;
        
        // グローバル状態を更新
        if let Ok(mut global_settings) = SETTINGS.lock() {
            *global_settings = settings.clone();
        }
        
        println!("✅ [Settings] Loaded settings from: {:?}", file_path);
        println!("📋 [Settings] Settings: {:?}", settings);
        Ok(settings)
    } else {
        let default_settings = AppSettings::default();
        
        // デフォルト設定をファイルに保存
        let json = serde_json::to_string_pretty(&default_settings)
            .map_err(|e| format!("Failed to serialize default settings: {}", e))?;
        
        fs::write(&file_path, json)
            .map_err(|e| format!("Failed to write default settings: {}", e))?;
        
        // グローバル状態を更新
        if let Ok(mut global_settings) = SETTINGS.lock() {
            *global_settings = default_settings.clone();
        }
        
        println!("📝 [Settings] Created default settings at: {:?}", file_path);
        Ok(default_settings)
    }
}