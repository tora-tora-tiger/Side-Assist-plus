use std::collections::HashMap;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use rand::Rng;
use lazy_static::lazy_static;
use tauri::Manager;
use axum::{
    extract::{Json, State},
    http::{HeaderMap, StatusCode},
    response::Json as JsonResponse,
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;
// ENIGOは完全に削除し、rdevを使用
use rdev::{EventType, Event};
use qrcode::QrCode;
use qrcode::render::svg;

// モジュール宣言
mod network;
mod storage;
mod keyboard;
mod simulation;
mod settings;

// モジュールからのインポート  
use network::get_local_ip_address;
use storage::{save_custom_actions, load_custom_actions};
use keyboard::{string_to_key, key_to_string, is_modifier_key, get_modifier_type};
use simulation::{simulate_typing, simulate_copy, simulate_paste};
use settings::{get_current_settings, update_settings_persistent, load_settings_persistent};

// グローバル録画状態（rdevコールバック用）
lazy_static! {
    static ref GLOBAL_RECORDING_STATE: Mutex<Option<GlobalRecordingState>> = Mutex::new(None);
    static ref SHOULD_STOP_RECORDING: AtomicBool = AtomicBool::new(false);
    static ref LAST_RECORDED_KEY: Mutex<Option<(String, u64)>> = Mutex::new(None); // (key_name, timestamp) for debouncing
    static ref MAIN_STATE_REF: Mutex<Option<AppState>> = Mutex::new(None); // メイン状態への参照
    static ref CURRENT_MODIFIERS: Mutex<KeyModifiers> = Mutex::new(KeyModifiers::default()); // 現在の修飾キー状態
}

#[derive(Clone, Debug)]
struct GlobalRecordingState {
    pub start_time: u64,
    pub recorded_keys: Arc<Mutex<Vec<RecordedKey>>>,
    pub shortcut_type: ShortcutType,
}

#[cfg(target_os = "macos")]
use std::process::Command;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ServerStatus {
    pub running: bool,
    pub connected_clients: usize,
    pub port: u16,
}

#[derive(Clone, Debug)]
pub struct ClientInfo {
    pub id: String,
    pub last_health_check: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ShortcutType {
    Normal,      // 通常のキーシーケンス
    Sequential,  // シーケンシャルショートカット（Alt → H → B → A）
}

impl Default for ShortcutType {
    fn default() -> Self {
        ShortcutType::Normal
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CustomAction {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub key_sequence: Vec<RecordedKey>,
    pub created_at: u64,
    #[serde(default)] // 既存データとの互換性を保つ
    pub shortcut_type: ShortcutType, // ショートカットのタイプ
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CustomActionsStorage {
    pub actions: Vec<CustomAction>,
    pub version: u32,
    pub last_updated: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct KeyModifiers {
    pub alt: bool,
    pub ctrl: bool,
    pub shift: bool,
    pub meta: bool,
}

impl Default for KeyModifiers {
    fn default() -> Self {
        Self {
            alt: false,
            ctrl: false,
            shift: false,
            meta: false,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecordedKey {
    pub key: String, // Key名を文字列として保存
    pub event_type: String, // "press" or "release"
    pub timestamp: u64, // 相対タイムスタンプ（ミリ秒）
    #[serde(default)] // 既存データとの互換性を保つ
    pub modifiers: KeyModifiers, // 修飾キーの状態
}


type AppState = Arc<Mutex<ServerState>>;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecordingModalInfo {
    pub action_id: String,
    pub name: String,
    pub icon: Option<String>,
    pub is_visible: bool,
    pub is_recording: bool,
    pub is_completed: bool, // 録画完了フラグ
    pub start_time: Option<u64>,
    pub recorded_keys: Vec<RecordedKey>,
    pub shortcut_type: ShortcutType, // ショートカットの種類
}

#[derive(Clone, Debug)]
pub struct ServerState {
    pub running: bool,
    pub connected_clients: HashMap<String, ClientInfo>,
    pub port: u16,
    pub one_time_password: Option<String>,
    pub password_expiry: Option<u64>,
    pub operation_in_progress: bool,
    pub custom_actions: HashMap<String, CustomAction>,
    pub recording_modal_info: Option<RecordingModalInfo>,
}

impl Default for ServerState {
    fn default() -> Self {
        Self {
            running: false,
            connected_clients: HashMap::new(),
            port: 8080,
            one_time_password: None,
            password_expiry: None,
            operation_in_progress: false,
            custom_actions: HashMap::new(), // Will be loaded asynchronously during startup
            recording_modal_info: None,
        }
    }
}

#[derive(Deserialize)]
struct InputRequest {
    pub action: ActionType,
    pub password: Option<String>,
}

#[derive(Deserialize, Debug)]
#[serde(tag = "type")]
pub enum ActionType {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "copy")]
    Copy,
    #[serde(rename = "paste")]
    Paste,
    #[serde(rename = "custom")]
    Custom { action_id: String },
    #[serde(rename = "prepare_recording")]
    PrepareRecording { 
        action_id: String,
        name: String,
        icon: Option<String>,
        shortcut_type: Option<String>, // "normal" or "sequential"
    },
    #[serde(rename = "gesture")]
    Gesture { 
        fingers: u8,
        direction: String,
        action: String,
        action_data: Option<String>,
    },
}

#[derive(Deserialize)]  
struct AuthRequest {
    password: String,
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    #[serde(rename = "clientID")]
    client_id: String,
    timestamp: u64,
    #[serde(rename = "connectedClients")]
    connected_clients: usize,
}

#[derive(Serialize)]
struct ApiResponse {
    success: bool,
    message: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RecordingStatusResponse {
    status: String, // "idle", "preparing", "recording", "completed"
    action_id: Option<String>,
    name: Option<String>,
    recorded_keys_count: Option<usize>,
    message: Option<String>,
}

#[tauri::command]
async fn load_custom_actions_on_startup(state: tauri::State<'_, AppState>) -> Result<String, String> {
    
    
    match load_custom_actions().await {
        Ok(loaded_actions) => {
            let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
            state_guard.custom_actions = loaded_actions;
            let count = state_guard.custom_actions.len();
            
            
            Ok(format!("Loaded {} custom actions", count))
        }
        Err(e) => {
            Err(format!("Failed to load custom actions: {}", e))
        }
    }
}

#[tauri::command]
async fn get_all_custom_actions(state: tauri::State<'_, AppState>) -> Result<Vec<CustomAction>, String> {
    let state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    let actions: Vec<CustomAction> = state_guard.custom_actions.values().cloned().collect();
    
    Ok(actions)
}

#[tauri::command]
async fn get_server_status(state: tauri::State<'_, AppState>) -> Result<ServerStatus, String> {
    let state = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(ServerStatus {
        running: state.running,
        connected_clients: state.connected_clients.len(),
        port: state.port,
    })
}

#[tauri::command]
async fn generate_one_time_password(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut rng = rand::thread_rng();
    let password: String = (0..5).map(|_| rng.gen_range(0..10).to_string()).collect();
    
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| format!("システム時刻の取得に失敗しました: {}", e))?
        .as_secs();
    
    let expiry = now + 300; // 5分間有効
    
    let mut state = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    state.one_time_password = Some(password.clone());
    state.password_expiry = Some(expiry);
    
    
    Ok(password)
}

#[tauri::command]
async fn get_current_password(state: tauri::State<'_, AppState>) -> Result<Option<String>, String> {
    let state = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    if let (Some(password), Some(expiry)) = (&state.one_time_password, state.password_expiry) {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("システム時刻の取得に失敗しました: {}", e))?
            .as_secs();
        
        if now < expiry {
            Ok(Some(password.clone()))
        } else {
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn generate_qr_code(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let state = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    // パスワードが存在するかチェック
    let password = if let (Some(password), Some(expiry)) = (&state.one_time_password, state.password_expiry) {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("システム時刻の取得に失敗しました: {}", e))?
            .as_secs();
        
        if now < expiry {
            password.clone()
        } else {
            return Err("パスワードが期限切れです。新しいパスワードを生成してください。".to_string());
        }
    } else {
        return Err("パスワードが生成されていません。まずパスワードを生成してください。".to_string());
    };

    // 本当のIPアドレスを取得
    
    let local_ip = match get_local_ip_address() {
        Some(ip) => {
            
            ip
        },
        None => {
            
            return Err("ローカルIPアドレスを取得できませんでした。ネットワーク接続を確認してください。".to_string());
        }
    };
    let port = state.port;
    
    // URLスキーム形式でデータを作成（改行や空白を確実に除去）
    let url_scheme = format!("sideassist://connect?ip={}&port={}&password={}", local_ip, port, password)
        .trim()
        .replace('\n', "")
        .replace('\r', "")
        .replace(' ', "");
    
    // デバッグ用詳細ログ
    
    
    
    
    
    
    

    // URLの各文字をチェック
    for (_i, ch) in url_scheme.chars().enumerate() {
        if ch.is_control() || ch == '\n' || ch == '\r' || ch == '\t' {
            
        }
    }
    
    // QRコードを生成
    let code = QrCode::new(&url_scheme)
        .map_err(|e| format!("QRコード生成エラー: {}", e))?;
    
    // SVG形式で生成（正しいColor型を使用）
    let svg_string = code.render::<svg::Color>()
        .min_dimensions(200, 200)
        .dark_color(svg::Color("#000000"))
        .light_color(svg::Color("#ffffff"))
        .build();
    
    
    Ok(svg_string)
}





// 保存されたキーシーケンスを再生する関数
async fn execute_custom_action(action: &CustomAction) -> Result<String, String> {
    
    
    tokio::task::spawn_blocking({
        let key_sequence = action.key_sequence.clone();
        let action_name = action.name.clone();
        let shortcut_type = action.shortcut_type.clone();
        
        move || {
            use std::{thread, time};
            
            // 再生開始前に少し待機
            thread::sleep(time::Duration::from_millis(200));
            
            match shortcut_type {
                ShortcutType::Sequential => {
                    execute_sequential_shortcut(&key_sequence, &action_name)
                }
                ShortcutType::Normal => {
                    execute_normal_shortcut(&key_sequence, &action_name)
                }
            }
        }
    }).await.map_err(|e| format!("Task error: {}", e))?
}

// 通常のショートカット実行（従来の方式）
fn execute_normal_shortcut(key_sequence: &[RecordedKey], action_name: &str) -> Result<String, String> {
    use rdev::{simulate, EventType, SimulateError};
    use std::{thread, time};
    
    fn send(event_type: &EventType) -> Result<(), SimulateError> {
        let delay = time::Duration::from_millis(50);
        let result = simulate(event_type);
        thread::sleep(delay);
        result
    }
    
    let mut executed_keys = 0;
    for recorded_key in key_sequence {
        if let Some(key) = string_to_key(&recorded_key.key) {
            if recorded_key.event_type == "press" {
                // キープレス
                send(&EventType::KeyPress(key))
                    .map_err(|e| format!("Failed to press key {}: {:?}", recorded_key.key, e))?;
                
                // キーリリース（セット実行）
                send(&EventType::KeyRelease(key))
                    .map_err(|e| format!("Failed to release key {}: {:?}", recorded_key.key, e))?;
                
                executed_keys += 1;
                
                
                thread::sleep(time::Duration::from_millis(50));
            }
        } else {
            
        }
    }
    
    
    Ok(format!("Successfully executed normal shortcut '{}' with {} keys", action_name, executed_keys))
}

// シーケンシャルショートカット実行（Alt → H → B → A 形式）
// 記録されたpress/releaseイベントを忠実に再現
fn execute_sequential_shortcut(key_sequence: &[RecordedKey], action_name: &str) -> Result<String, String> {
    use rdev::{simulate, EventType, SimulateError};
    use std::{thread, time, collections::HashSet};
    
    fn send_key_event(event_type: &EventType) -> Result<(), SimulateError> {
        let delay = time::Duration::from_millis(20); // 高速化
        let result = simulate(event_type);
        thread::sleep(delay);
        result
    }
    
    // エラー時の修飾キークリーンアップ用
    fn cleanup_modifiers(active_modifiers: &HashSet<String>) {
        for modifier_key in active_modifiers {
            if let Some(key) = string_to_key(modifier_key) {
                let _ = send_key_event(&EventType::KeyRelease(key));
                
            }
        }
    }
    
    let mut active_modifiers = HashSet::new();
    let mut executed_keys = 0;
    
    
    
    // 記録されたイベントを順次実行（press/release を完全に忠実に再現）
    let execution_result: Result<(), String> = (|| {
        for (index, recorded_key) in key_sequence.iter().enumerate() {
            if let Some(key) = string_to_key(&recorded_key.key) {
                let is_modifier = is_modifier_key(key);
                
                match recorded_key.event_type.as_str() {
                    "press" => {
                        send_key_event(&EventType::KeyPress(key))
                            .map_err(|e| format!("Failed to press key {}: {:?}", recorded_key.key, e))?;
                        
                        if is_modifier {
                            active_modifiers.insert(recorded_key.key.clone());
                            
                        } else {
                            executed_keys += 1;
                        }
                    }
                    "release" => {
                        send_key_event(&EventType::KeyRelease(key))
                            .map_err(|e| format!("Failed to release key {}: {:?}", recorded_key.key, e))?;
                        
                        if is_modifier {
                            active_modifiers.remove(&recorded_key.key);
                            
                        } else {
                            
                        }
                    }
                    _ => {
                        
                    }
                }
                
                // イベント間の適切な遅延（実際のタイミングを再現）
                if index < key_sequence.len() - 1 {
                    let current_time = recorded_key.timestamp;
                    let next_time = key_sequence[index + 1].timestamp;
                    let delay = (next_time.saturating_sub(current_time)).min(100); // 最大100ms
                    
                    if delay > 5 { // 5ms以上の遅延のみ適用
                        thread::sleep(time::Duration::from_millis(delay));
                    }
                }
                
            } else {
                
            }
        }
        Ok(())
    })();
    
    // エラー発生時の修飾キークリーンアップ
    if execution_result.is_err() {
        cleanup_modifiers(&active_modifiers);
    }
    
    
    Ok(format!("Successfully executed sequential shortcut '{}' with {} keys", action_name, executed_keys))
}

#[tauri::command]
async fn set_port(state: tauri::State<'_, AppState>, port: u16) -> Result<String, String> {
    let mut state = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    if state.operation_in_progress {
        return Err("サーバー操作が実行中です。しばらくお待ちください。".to_string());
    }
    
    if state.running {
        return Err("サーバーが実行中です。まずサーバーを停止してください。".to_string());
    }
    
    // ポート番号の妥当性チェック (u16の上限は65535なので上限チェックは不要)
    if port < 1024 {
        return Err("ポート番号は1024以上で指定してください。".to_string());
    }
    
    state.port = port;
    
    Ok(format!("Port set to {}", port))
}

#[tauri::command]
async fn stop_server(state: tauri::State<'_, AppState>) -> Result<String, String> {
    // 最初のチェックと状態設定
    {
        let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        
        if state_guard.operation_in_progress {
            return Err("サーバー操作が実行中です。しばらくお待ちください。".to_string());
        }
        
        if !state_guard.running {
            return Ok("Server is not running".to_string());
        }
        
        state_guard.operation_in_progress = true;
        state_guard.running = false;
        state_guard.connected_clients.clear();
        
    } // MutexGuardはここで解放される
    
    // サーバーが完全に停止するまで待機
    tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;
    
    // 操作完了フラグをクリア
    {
        let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        state_guard.operation_in_progress = false;
    } // MutexGuardはここで解放される
    
    
    Ok("Server stopped".to_string())
}

#[tauri::command]
async fn start_server(state: tauri::State<'_, AppState>) -> Result<String, String> {
    
    let app_state = Arc::clone(&state);
    
    let port = {
        let mut state = app_state.lock().map_err(|e| {
            
            format!("Failed to lock state: {}", e)
        })?;
        
        if state.operation_in_progress {
            
            return Err("サーバー操作が実行中です。しばらくお待ちください。".to_string());
        }
        
        if state.running {
            
            return Err("Server is already running. Stop it first before starting a new one.".to_string());
        }
        
        
        state.operation_in_progress = true;
        state.port
    };

    // ポートが使用可能かチェック（一時的にバインドしてすぐに解放）
    {
        let test_listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", port)).await;
        if let Err(e) = test_listener {
            let mut state = app_state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
            state.operation_in_progress = false;
            return Err(format!("ポート{}は使用できません: {}", port, e));
        }
        // test_listenerはここで自動的にドロップされ、ポートが解放される
    }

    // サーバーを実際に開始
    {
        let mut state = app_state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        state.running = true;
        state.operation_in_progress = false;
    }

    let server_state = Arc::clone(&app_state);
    let error_state = Arc::clone(&app_state);
    tokio::spawn(async move {
        if let Err(_e) = run_http_server(server_state).await {
            if let Ok(mut state) = error_state.lock() {
                state.running = false;
                state.operation_in_progress = false;
            }
        }
    });

    // Start client cleanup task
    let cleanup_state = Arc::clone(&app_state);
    tokio::spawn(async move {
        cleanup_inactive_clients(cleanup_state).await;
    });

    
    Ok(format!("Side Assist Server started on port {}", port))
}

#[tauri::command]
async fn check_accessibility_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        // 権限チェック：System Eventsに簡単なアクセスを試行
        // AppleScriptでエラー処理を含む形式を使用
        let script = r#"
            try
                tell application "System Events"
                    get name of first application process
                end tell
                return "granted"
            on error
                return "denied"
            end try
        "#;
        
        let output = Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| format!("Failed to execute permission check: {}", e))?;
        
        // スクリプトの出力を確認
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let has_permission = output.status.success() && stdout.contains("granted");
        
        
        
        
        
        
        if !has_permission {
            if let Ok(stderr) = String::from_utf8(output.stderr) {
                if !stderr.trim().is_empty() {
                    
                }
            }
        }
        
        Ok(has_permission)
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        // macOS以外では常にtrueを返す（Windowsなどは権限チェック不要）
        Ok(true)
    }
}

#[tauri::command]
async fn open_system_preferences() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        // macOSのシステム設定（アクセシビリティ）を開く
        // Sonoma/Sequoia対応: 複数のURL形式を試行
        let urls = [
            "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
            "x-apple.systempreferences:com.apple.preference.security?Privacy",
            "x-apple.systempreferences:com.apple.preference.security"
        ];
        
        let mut last_error = String::new();
        for url in &urls {
            let output = Command::new("open")
                .arg(url)
                .output();
                
            match output {
                Ok(result) if result.status.success() => {
                    
                    return Ok("システム設定を開きました".to_string());
                }
                Ok(result) => {
                    let stderr = String::from_utf8_lossy(&result.stderr);
                    
                    last_error = format!("URL {} failed: {}", url, stderr);
                }
                Err(e) => {
                    
                    last_error = format!("Failed to execute: {}", e);
                }
            }
        }
        
        Err(format!("全てのURL形式で失敗しました: {}", last_error))
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Err("macOS以外ではサポートされていません".to_string())
    }
}






#[tauri::command]
async fn get_recording_modal_info(state: tauri::State<'_, AppState>) -> Result<Option<RecordingModalInfo>, String> {
    let state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    Ok(state_guard.recording_modal_info.clone())
}

#[tauri::command]
async fn clear_recording_modal(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    state_guard.recording_modal_info = None;
    
    Ok("Recording modal cleared".to_string())
}

#[tauri::command]
async fn start_actual_recording(state: tauri::State<'_, AppState>, shortcut_type: String) -> Result<String, String> {
    let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
    
    if let Some(ref mut modal_info) = state_guard.recording_modal_info {
        modal_info.is_recording = true;
        modal_info.start_time = Some(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .map_err(|_| "Failed to get system time")?
                .as_millis() as u64
        );
        modal_info.recorded_keys.clear();
        
        // Set shortcut type based on parameter
        modal_info.shortcut_type = if shortcut_type == "Sequential" { 
            ShortcutType::Sequential 
        } else { 
            ShortcutType::Normal 
        };
        
        
        
        // リアルキーリスナー開始
        let state_clone = Arc::clone(&state);
        tokio::spawn(async move {
            start_real_key_listener(state_clone).await;
        });
        
        Ok(format!("Recording started for: {}", modal_info.name))
    } else {
        Err("No recording modal active".to_string())
    }
}

#[tauri::command]
async fn stop_actual_recording(state: tauri::State<'_, AppState>) -> Result<String, String> {
    // まず録画停止フラグを設定
    {
        let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        
        if let Some(ref mut modal_info) = state_guard.recording_modal_info {
            modal_info.is_recording = false;
            
        } else {
            return Err("No recording modal active".to_string());
        }
    }
    
    // キー同期が完了するまで少し待機
    tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
    
    let modal_info = {
        let state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        
        if let Some(ref modal_info) = state_guard.recording_modal_info {
            modal_info.clone()
        } else {
            return Err("No recording modal active".to_string());
        }
    };
    
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "Failed to get system time")?
        .as_secs();
    
    // カスタムアクションを作成して保存
    let custom_action = CustomAction {
        id: modal_info.action_id.clone(),
        name: modal_info.name.clone(),
        icon: modal_info.icon,
        key_sequence: modal_info.recorded_keys,
        created_at: now,
        shortcut_type: modal_info.shortcut_type.clone(), // 録画時に設定されたタイプを使用
    };
    
    // 状態に追加して保存
    {
        let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        
        
        state_guard.custom_actions.insert(modal_info.action_id.clone(), custom_action.clone());
        
        
        // モーダル状態を録画完了状態に更新（即座にクリアしない）
        if let Some(ref mut modal_info) = state_guard.recording_modal_info {
            modal_info.is_recording = false;
            modal_info.is_completed = true; // 完了フラグを設定
            modal_info.recorded_keys = custom_action.key_sequence.clone();
        }
    }
    
    // カスタムアクションをファイルに永続化保存
    {
        let state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        let actions_to_save = state_guard.custom_actions.clone();
        drop(state_guard); // ロックを早期解放
        
        // 非同期保存を実行
        tokio::spawn(async move {
            
            if let Err(_e) = save_custom_actions(&actions_to_save).await {
                // Error handling for save_custom_actions
            }
        });
    }
    
    
    
    Ok(format!(
        "Recording stopped. Saved {} key events for: {}",
        custom_action.key_sequence.len(),
        custom_action.name
    ))
}

// rdevコールバック関数（グローバル関数として定義）
fn rdev_callback(event: Event) {
    // 停止フラグをチェック
    if SHOULD_STOP_RECORDING.load(Ordering::Relaxed) {
        return;
    }
    
    // 修飾キーの状態を更新（常に実行）
    match event.event_type {
        EventType::KeyPress(key) => {
            if is_modifier_key(key) {
                update_modifier_state(key, true);
            }
        }
        EventType::KeyRelease(key) => {
            if is_modifier_key(key) {
                update_modifier_state(key, false);
            }
        }
        _ => {}
    }
    
    // グローバル録画状態から情報を取得
    let (start_time, recorded_keys, shortcut_type) = {
        if let Ok(recording_state_guard) = GLOBAL_RECORDING_STATE.lock() {
            if let Some(ref state) = *recording_state_guard {
                (state.start_time, Arc::clone(&state.recorded_keys), state.shortcut_type.clone())
            } else {
                return; // 録画状態がない場合は終了
            }
        } else {
            return;
        }
    };
    
    // ショートカットタイプに応じてキーイベントをフィルタリング
    match event.event_type {
        EventType::KeyPress(key) | EventType::KeyRelease(key) => {
            let event_type_str = match event.event_type {
                EventType::KeyPress(_) => "press",
                EventType::KeyRelease(_) => "release",
                _ => return,
            };
            
            // シーケンシャルモードではpressイベントのみ記録
            // 通常モードでは修飾キーはpress/release両方、通常キーはpressのみ記録
            let should_record_event = match shortcut_type {
                ShortcutType::Sequential => {
                    // シーケンシャルモード: pressイベントのみ
                    event_type_str == "press"
                }
                ShortcutType::Normal => {
                    // 通常モード: 修飾キーは両方、通常キーはpressのみ
                    if is_modifier_key(key) {
                        true // 修飾キーは両方のイベントを記録
                    } else {
                        event_type_str == "press" // 通常キーはpressのみ
                    }
                }
            };
            
            if !should_record_event {
                return;
            }
            
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis() as u64;
            
            let key_name = key_to_string(key);
            
            // 改良されたデバウンス: キー+イベントタイプの組み合わせで重複チェック
            let should_record = {
                let debounce_key = format!("{}_{}", key_name, event_type_str);
                if let Ok(mut last_key_guard) = LAST_RECORDED_KEY.lock() {
                    if let Some((last_key, last_time)) = &*last_key_guard {
                        if debounce_key == *last_key && now.saturating_sub(*last_time) < 200 {
                            // 同じキー+イベントが200ms以内 - 重複とみなす
                            eprintln!("[DEBUG] Debounced: {} {} ({}ms ago)", 
                                      key_name, event_type_str, now.saturating_sub(*last_time));
                            false
                        } else {
                            // 異なるキーまたは十分時間が経過 - 記録する
                            *last_key_guard = Some((debounce_key.clone(), now));
                            true
                        }
                    } else {
                        // 初回記録
                        *last_key_guard = Some((debounce_key.clone(), now));
                        true
                    }
                } else {
                    true
                }
            };
        
            if should_record {
                // デバッグログ - 実際に記録されるキーのみ表示
                eprintln!("[DEBUG] Recording key: {} {} (shortcut_type: {:?})", 
                          key_name, event_type_str, shortcut_type);
                
                let relative_time = now.saturating_sub(start_time);
                
                // 現在の修飾キー状態を取得
                let modifiers = {
                    if let Ok(modifier_guard) = CURRENT_MODIFIERS.lock() {
                        modifier_guard.clone()
                    } else {
                        KeyModifiers::default()
                    }
                };
                
                let recorded_key = RecordedKey {
                    key: key_name.clone(),
                    event_type: event_type_str.to_string(),
                    timestamp: relative_time,
                    modifiers, // 修飾キーの状態を含める
                };
            
                // グローバル録画状態に追加
                if let Ok(mut keys_guard) = recorded_keys.lock() {
                    keys_guard.push(recorded_key.clone());
                    // キー入力直後にメイン状態にも即座に同期
                    sync_to_main_state(&keys_guard);
                }
            } else {
                
            }
        }
        _ => {}
    }
}

// 修飾キーの状態を更新する関数
fn update_modifier_state(key: rdev::Key, pressed: bool) {
    if let Ok(mut modifier_guard) = CURRENT_MODIFIERS.lock() {
        match get_modifier_type(key) {
            Some("alt") => {
                modifier_guard.alt = pressed;
                
            }
            Some("ctrl") => {
                modifier_guard.ctrl = pressed;
                
            }
            Some("shift") => {
                modifier_guard.shift = pressed;
                
            }
            Some("meta") => {
                modifier_guard.meta = pressed;
                
            }
            _ => {}
        }
    }
}

// メイン状態への即座同期関数
fn sync_to_main_state(keys: &Vec<RecordedKey>) {
    if let Ok(main_state_guard) = MAIN_STATE_REF.lock() {
        if let Some(ref main_state) = *main_state_guard {
            if let Ok(mut state_guard) = main_state.lock() {
                if let Some(ref mut modal_info) = state_guard.recording_modal_info {
                    modal_info.recorded_keys = keys.clone();
                    // 
                }
            }
        }
    }
}

// リアルキーリスナー実装（グローバルstateを使用）
async fn start_real_key_listener(state: AppState) {
    
    
    // メイン状態への参照を設定
    {
        let mut main_state_ref = MAIN_STATE_REF.lock().unwrap();
        *main_state_ref = Some(Arc::clone(&state));
    }
    
    // 録画開始時刻、記録用のベクター、ショートカットタイプを取得
    let (start_time, recorded_keys, shortcut_type) = {
        if let Ok(state_guard) = state.lock() {
            if let Some(ref modal_info) = state_guard.recording_modal_info {
                let start_time = modal_info.start_time.unwrap_or(0);
                let recorded_keys = Arc::new(Mutex::new(Vec::new()));
                let shortcut_type = modal_info.shortcut_type.clone();
                (start_time, recorded_keys, shortcut_type)
            } else {
                return; // モーダル情報がない場合は終了
            }
        } else {
            return;
        }
    };
    
    // グローバル録画状態を設定
    {
        let mut global_state = GLOBAL_RECORDING_STATE.lock().unwrap();
        *global_state = Some(GlobalRecordingState {
            start_time,
            recorded_keys: Arc::clone(&recorded_keys),
            shortcut_type: shortcut_type.clone(),
        });
    }
    
    // 停止フラグをリセット
    SHOULD_STOP_RECORDING.store(false, Ordering::Relaxed);
    
    // rdev::listenは別スレッドで実行
    let listener_handle = tokio::task::spawn_blocking(move || {
        use rdev::listen;
        
        
        
        // rdev::listenでキーイベントを監視（関数ポインタを使用）
        if let Err(_error) = listen(rdev_callback) {
            // Error handling for rdev listen
        }
        
        
    });
    
    // シンプルな監視ループ（停止待ち）
    loop {
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        let should_continue = {
            if let Ok(state_guard) = state.lock() {
                if let Some(ref modal_info) = state_guard.recording_modal_info {
                    modal_info.is_recording
                } else {
                    false
                }
            } else {
                false
            }
        };
        
        if !should_continue {
            
            
            // rdev::listenを停止する信号を送信
            SHOULD_STOP_RECORDING.store(true, Ordering::Relaxed);
            
            // グローバル状態をクリア
            {
                let mut global_state = GLOBAL_RECORDING_STATE.lock().unwrap();
                *global_state = None;
            }
            
            // メイン状態参照もクリア
            {
                let mut main_state_ref = MAIN_STATE_REF.lock().unwrap();
                *main_state_ref = None;
            }
            
            break;
        }
    }
    
    
    
    // リスナータスクの終了を待つ（タイムアウト付き）
    let timeout = tokio::time::Duration::from_millis(1000);
    let _ = tokio::time::timeout(timeout, listener_handle).await;
}

async fn run_http_server(state: AppState) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let port = {
        let state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        state_guard.port
    };

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/input", post(handle_input))
        .route("/auth", post(handle_auth))
        .route("/recording/status", get(get_recording_status))
        .route("/recording/acknowledge", post(acknowledge_recording))
        .route("/custom_actions", get(get_custom_actions))
        .route("/settings", get(get_settings))
        .route("/settings", post(update_settings_endpoint))
        .layer(CorsLayer::permissive())
        .with_state(Arc::clone(&state));

    let bind_addr = format!("0.0.0.0:{}", port);
    
    
    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    
    
    
    
    
    
    
    // サーバーの実行中に定期的にstateをチェックして停止する
    let server_task = tokio::spawn(async move {
        axum::serve(listener, app).await
    });
    
    // サーバー状態監視タスク
    let monitor_state = Arc::clone(&state);
    let monitor_task = tokio::spawn(async move {
        let mut interval = tokio::time::interval(tokio::time::Duration::from_millis(500));
        loop {
            interval.tick().await;
            if let Ok(state_guard) = monitor_state.lock() {
                if !state_guard.running {
                    
                    break;
                }
            }
        }
    });
    
    // どちらかのタスクが完了したら終了
    tokio::select! {
        result = server_task => {
            match result {
                Ok(Ok(())) => {},
                Ok(Err(_e)) => {},
                Err(_e) => {},
            }
        }
        _ = monitor_task => {
            
        }
    }
    
    // 状態を更新
    if let Ok(mut state_guard) = state.lock() {
        state_guard.running = false;
        state_guard.connected_clients.clear();
        state_guard.operation_in_progress = false;
    }
    
    Ok(())
}

async fn health_check(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<JsonResponse<HealthResponse>, StatusCode> {
    
    
    
    let client_id = match headers.get("x-client-id").and_then(|h| h.to_str().ok()) {
        Some(id) => {
            
            id.to_string()
        },
        None => {
            
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .as_secs();

    let mut state = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    state.connected_clients.insert(
        client_id.clone(),
        ClientInfo {
            id: client_id.clone(),
            last_health_check: timestamp,
        },
    );

    let client_count = state.connected_clients.len();
    
    
    
    Ok(JsonResponse(HealthResponse {
        status: "ok".to_string(),
        service: "Side Assist Desktop Server".to_string(),
        client_id,
        timestamp,
        connected_clients: client_count,
    }))
}

async fn handle_input(
    State(state): State<AppState>,
    Json(payload): Json<InputRequest>,
) -> Result<JsonResponse<ApiResponse>, StatusCode> {
    
    // パスワード認証チェック
    if let Some(provided_password) = &payload.password {
        let is_valid = {
            let state = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            
            if let (Some(stored_password), Some(expiry)) = (&state.one_time_password, state.password_expiry) {
                let now = match SystemTime::now().duration_since(UNIX_EPOCH) {
                    Ok(duration) => duration.as_secs(),
                    Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
                };
                
                provided_password == stored_password && now < expiry
            } else {
                false
            }
        };
        
        if !is_valid {
        
            return Err(StatusCode::UNAUTHORIZED);
        }
    } else {
        
        return Err(StatusCode::UNAUTHORIZED);
    }
    
    
    
    // アクションタイプに基づいて処理を分岐
    let result = match &payload.action {
        ActionType::Text { text } => {
            
            simulate_typing(text.clone()).await
        }
        ActionType::Copy => {
            
            simulate_copy().await
        }
        ActionType::Paste => {
            
            simulate_paste().await
        }
        ActionType::Custom { action_id } => {
            
            let action = {
                let state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                state_guard.custom_actions.get(action_id).cloned()
            };
            
            if let Some(action) = action {
                
                execute_custom_action(&action).await
            } else {
                Err(format!("Custom action '{}' not found", action_id))
            }
        }
        ActionType::PrepareRecording { action_id, name, icon, shortcut_type } => {
            
            
            let mut state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
            
            // ショートカットタイプを決定
            let determined_shortcut_type = match shortcut_type.as_deref() {
                Some("sequential") => ShortcutType::Sequential,
                _ => ShortcutType::Normal,
            };
            
            // 録画モーダル情報を設定
            state_guard.recording_modal_info = Some(RecordingModalInfo {
                action_id: action_id.clone(),
                name: name.clone(),
                icon: icon.clone(),
                is_visible: true,
                is_recording: false,
                is_completed: false, // 初期状態では未完了
                start_time: None,
                recorded_keys: Vec::new(),
                shortcut_type: determined_shortcut_type.clone(),
            });
            
            
            Ok(format!("Recording prepared for action: {} (type: {:?})", name, determined_shortcut_type))
        }
        ActionType::Gesture { fingers: _, direction: _, action, action_data } => {
            
            
            match action.as_str() {
                "copy" => {
                    
                    simulate_copy().await
                }
                "paste" => {
                    
                    simulate_paste().await
                }
                "text_input" => {
                    if let Some(text) = action_data {
                        
                        simulate_typing(text.clone()).await
                    } else {
                        Err("No text data provided for gesture text input".to_string())
                    }
                }
                "custom_action" => {
                    
                    // 最初のカスタムアクションを実行
                    let action = {
                        let state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                        state_guard.custom_actions.values().next().cloned()
                    };
                    
                    if let Some(action) = action {
                        
                        execute_custom_action(&action).await
                    } else {
                        Err("No custom actions available for gesture".to_string())
                    }
                }
                _ => {
                    Err(format!("Unknown gesture action: {}", action))
                }
            }
        }
    };
    
    match result {
        Ok(message) => {
            
            Ok(JsonResponse(ApiResponse {
                success: true,
                message,
            }))
        }
        Err(e) => {
            Ok(JsonResponse(ApiResponse {
                success: false,
                message: e,
            }))
        }
    }
}

async fn handle_auth(
    State(state): State<AppState>,
    Json(payload): Json<AuthRequest>,
) -> Result<JsonResponse<ApiResponse>, StatusCode> {
    let is_valid = {
        let state = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        
        if let (Some(stored_password), Some(expiry)) = (&state.one_time_password, state.password_expiry) {
            let now = match SystemTime::now().duration_since(UNIX_EPOCH) {
                Ok(duration) => duration.as_secs(),
                Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
            };
            
            payload.password == *stored_password && now < expiry
        } else {
            false
        }
    };
    
    if is_valid {
        
        Ok(JsonResponse(ApiResponse {
            success: true,
            message: "Authentication successful".to_string(),
        }))
    } else {
        
        Err(StatusCode::UNAUTHORIZED)
    }
}

async fn get_recording_status(
    State(state): State<AppState>,
) -> Result<JsonResponse<RecordingStatusResponse>, StatusCode> {
    let state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let response = if let Some(ref modal_info) = state_guard.recording_modal_info {
        if modal_info.is_completed {
            // 録画完了状態
            RecordingStatusResponse {
                status: "completed".to_string(),
                action_id: Some(modal_info.action_id.clone()),
                name: Some(modal_info.name.clone()),
                recorded_keys_count: Some(modal_info.recorded_keys.len()),
                message: Some(format!("録画完了：「{}」に{}個のキーを保存しました", modal_info.name, modal_info.recorded_keys.len())),
            }
        } else if modal_info.is_recording {
            // 録画中
            RecordingStatusResponse {
                status: "recording".to_string(),
                action_id: Some(modal_info.action_id.clone()),
                name: Some(modal_info.name.clone()),
                recorded_keys_count: Some(modal_info.recorded_keys.len()),
                message: Some("録画中...".to_string()),
            }
        } else {
            // 録画準備状態
            RecordingStatusResponse {
                status: "preparing".to_string(),
                action_id: Some(modal_info.action_id.clone()),
                name: Some(modal_info.name.clone()),
                recorded_keys_count: None,
                message: Some("録画準備完了".to_string()),
            }
        }
    } else {
        // アイドル状態
        RecordingStatusResponse {
            status: "idle".to_string(),
            action_id: None,
            name: None,
            recorded_keys_count: None,
            message: None,
        }
    };
    
    Ok(JsonResponse(response))
}

async fn get_custom_actions(
    State(state): State<AppState>,
) -> Result<JsonResponse<Vec<CustomAction>>, StatusCode> {
    let state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let actions: Vec<CustomAction> = state_guard.custom_actions.values().cloned().collect();
    
    
    for _action in &actions {
        // Action processing logic would go here
    }
    
    Ok(JsonResponse(actions))
}

// Settings endpoints
async fn get_settings(
    State(state): State<AppState>,
) -> Result<JsonResponse<settings::AppSettings>, StatusCode> {
    let _state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let current_settings = get_current_settings();
    
    
    Ok(JsonResponse(current_settings))
}

#[derive(Deserialize)]
struct UpdateSettingsRequest {
    settings: serde_json::Value,
}

async fn update_settings_endpoint(
    State(state): State<AppState>,
    Json(request): Json<UpdateSettingsRequest>,
) -> Result<JsonResponse<settings::AppSettings>, StatusCode> {
    let _state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    
    
    // settings.rsのupdate_settings関数を使用して永続化
    // アプリハンドルが必要だが、storage.rsのパターンに合わせて独立したパス取得を使用
    match update_settings_persistent(request.settings) {
        Ok(updated_settings) => {
            
            Ok(JsonResponse(updated_settings))
        }
        Err(_e) => {
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn acknowledge_recording(
    State(state): State<AppState>,
) -> Result<JsonResponse<ApiResponse>, StatusCode> {
    let mut state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    if let Some(ref modal_info) = state_guard.recording_modal_info {
        if modal_info.is_completed {
            // 録画完了状態をクリア
            state_guard.recording_modal_info = None;
            
            
            Ok(JsonResponse(ApiResponse {
                success: true,
                message: "Recording acknowledged".to_string(),
            }))
        } else {
            Ok(JsonResponse(ApiResponse {
                success: false,
                message: "No completed recording to acknowledge".to_string(),
            }))
        }
    } else {
        Ok(JsonResponse(ApiResponse {
            success: false,
            message: "No recording session active".to_string(),
        }))
    }
}

async fn cleanup_inactive_clients(state: AppState) {
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
    
    loop {
        interval.tick().await;
        
        let now = match SystemTime::now().duration_since(UNIX_EPOCH) {
            Ok(duration) => duration.as_secs(),
            Err(_) => {
                continue; // スキップして次のループ処理を継続
            }
        };
        
        if let Ok(mut state) = state.lock() {
            let timeout = 15; // 15 seconds timeout
            let mut to_remove = Vec::new();
            
            for (client_id, client_info) in &state.connected_clients {
                if now - client_info.last_health_check > timeout {
                    to_remove.push(client_id.clone());
                }
            }
            
            for client_id in &to_remove {
                state.connected_clients.remove(client_id);
                
            }
            
            if !to_remove.is_empty() {
                
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut initial_state = ServerState::default();
    // アプリ起動時に状態をクリア
    initial_state.running = false;
    initial_state.operation_in_progress = false;
    initial_state.connected_clients.clear();
    
    let state = Arc::new(Mutex::new(initial_state));
    
    
    
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_macos_permissions::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_server_status,
            set_port,
            stop_server,
            start_server,
            simulate_typing,
            simulate_copy,
            simulate_paste,
            check_accessibility_permission,
            open_system_preferences,
            generate_one_time_password,
            get_current_password,
            generate_qr_code,
            get_recording_modal_info,
            clear_recording_modal,
            start_actual_recording,
            stop_actual_recording,
            load_custom_actions_on_startup,
            get_all_custom_actions
        ])
        .setup(|app| {
            // Tauri起動後にカスタムアクションと設定を読み込み
            let state: tauri::State<AppState> = app.state();
            let state_clone: Arc<Mutex<ServerState>> = Arc::clone(&state);
            
            tauri::async_runtime::spawn(async move {
                // 設定を読み込み
                
                match load_settings_persistent() {
                    Ok(_settings) => {
                        
                    }
                    Err(_e) => {
                        // Error handling for load_settings_persistent failure
                    }
                }
                
                // カスタムアクションを読み込み
                
                match load_custom_actions().await {
                    Ok(loaded_actions) => {
                        if let Ok(mut state_guard) = state_clone.lock() {
                            state_guard.custom_actions = loaded_actions;
                            
                        } else {
                            // Error handling for state lock failure
                        }
                    }
                    Err(_e) => {
                        // Error handling for load_custom_actions failure
                    }
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
