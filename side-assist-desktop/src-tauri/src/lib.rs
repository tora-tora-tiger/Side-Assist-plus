use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use rand::Rng;
use axum::{
    extract::{Json, State},
    http::{HeaderMap, StatusCode},
    response::Json as JsonResponse,
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;
// ENIGOは完全に削除し、rdevを使用
use rdev::Key;
use qrcode::QrCode;
use qrcode::render::svg;

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
pub struct CustomAction {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub key_sequence: Vec<RecordedKey>,
    pub created_at: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecordedKey {
    pub key: String, // Key名を文字列として保存
    pub event_type: String, // "press" or "release"
    pub timestamp: u64, // 相対タイムスタンプ（ミリ秒）
}

#[derive(Clone, Debug)]
pub struct RecordingSession {
    pub action_id: String,
    pub name: String,
    pub icon: Option<String>,
    pub start_time: u64,
    pub keys: Vec<RecordedKey>,
}

type AppState = Arc<Mutex<ServerState>>;

#[derive(Clone, Debug)]
pub struct ServerState {
    pub running: bool,
    pub connected_clients: HashMap<String, ClientInfo>,
    pub port: u16,
    pub one_time_password: Option<String>,
    pub password_expiry: Option<u64>,
    pub operation_in_progress: bool,
    pub custom_actions: HashMap<String, CustomAction>,
    pub recording_session: Option<RecordingSession>,
    pub key_listener_active: bool,
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
            custom_actions: HashMap::new(), // Will be loaded on startup
            recording_session: None,
            key_listener_active: false,
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
    #[serde(rename = "record_start")]
    RecordStart { 
        action_id: String,
        name: String,
        icon: Option<String>,
    },
    #[serde(rename = "record_stop")]
    RecordStop { action_id: String },
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
    
    println!("🔐 Generated OTP: {} (expires in 5 minutes)", password);
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
    println!("🌐 Attempting to get local IP address...");
    let local_ip = match get_local_ip_address() {
        Some(ip) => {
            println!("✅ Successfully obtained local IP: {}", ip);
            ip
        },
        None => {
            println!("❌ Failed to obtain local IP address");
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
    println!("🔧 [DEBUG] QR Code generation details:");
    println!("  IP: '{}'", local_ip);
    println!("  Port: {}", port);
    println!("  Password: '{}'", password);
    println!("  Generated URL: '{}'", url_scheme);
    println!("  URL length: {}", url_scheme.len());
    println!("  URL bytes: {:?}", url_scheme.as_bytes());

    // URLの各文字をチェック
    for (i, ch) in url_scheme.chars().enumerate() {
        if ch.is_control() || ch == '\n' || ch == '\r' || ch == '\t' {
            println!("  ⚠️ Control character at position {}: {:?} (code: {})", i, ch, ch as u32);
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
    
    println!("✅ QR code generated successfully");
    Ok(svg_string)
}

fn get_local_ip_address() -> Option<String> {
    use std::net::UdpSocket;
    
    // 最も確実な方法：UDP socket を使って外部に接続し、実際のローカルIPを取得
    if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(addr) = socket.local_addr() {
                let ip = addr.ip().to_string();
                println!("🌐 Detected local IP address: {}", ip);
                return Some(ip);
            }
        }
    }
    
    // 別のアプローチ：複数の外部サーバーに接続を試行
    let test_servers = ["8.8.8.8:80", "1.1.1.1:80", "208.67.222.222:80"];
    for server in &test_servers {
        if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
            if socket.connect(server).is_ok() {
                if let Ok(addr) = socket.local_addr() {
                    let ip = addr.ip().to_string();
                    println!("🌐 Detected local IP address via {}: {}", server, ip);
                    return Some(ip);
                }
            }
        }
    }
    
    println!("❌ Could not detect local IP address");
    None
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
    println!("🔧 Port changed to: {}", port);
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
        println!("🛑 Server marked as stopped (will terminate on next request cycle)");
    } // MutexGuardはここで解放される
    
    // サーバーが完全に停止するまで待機
    tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;
    
    // 操作完了フラグをクリア
    {
        let mut state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        state_guard.operation_in_progress = false;
    } // MutexGuardはここで解放される
    
    println!("✅ Server stop operation completed");
    Ok("Server stopped".to_string())
}

#[tauri::command]
async fn start_server(state: tauri::State<'_, AppState>) -> Result<String, String> {
    println!("🚀 start_server command called");
    let app_state = Arc::clone(&state);
    
    let port = {
        let mut state = app_state.lock().map_err(|e| {
            println!("❌ Failed to lock state: {}", e);
            format!("Failed to lock state: {}", e)
        })?;
        
        println!("📊 Current state: running={}, operation_in_progress={}, port={}", 
                state.running, state.operation_in_progress, state.port);
        
        if state.operation_in_progress {
            println!("⚠️ Operation already in progress");
            return Err("サーバー操作が実行中です。しばらくお待ちください。".to_string());
        }
        
        if state.running {
            println!("⚠️ Server already running");
            return Err("Server is already running. Stop it first before starting a new one.".to_string());
        }
        
        println!("✅ Setting operation_in_progress = true");
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
        if let Err(e) = run_http_server(server_state).await {
            eprintln!("Server error: {}", e);
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

    println!("✅ Server start operation completed on port {}", port);
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
        
        println!("🔍 Accessibility permission check:");
        println!("   Status: {}", output.status.success());
        println!("   Output: '{}'", stdout);
        println!("   Result: {}", has_permission);
        
        if !has_permission {
            if let Ok(stderr) = String::from_utf8(output.stderr) {
                if !stderr.trim().is_empty() {
                    println!("❌ Permission check stderr: {}", stderr);
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
                    println!("✅ Successfully opened system settings with URL: {}", url);
                    return Ok("システム設定を開きました".to_string());
                }
                Ok(result) => {
                    let stderr = String::from_utf8_lossy(&result.stderr);
                    println!("⚠️ URL {} failed: {}", url, stderr);
                    last_error = format!("URL {} failed: {}", url, stderr);
                }
                Err(e) => {
                    println!("❌ Failed to execute open command for {}: {}", url, e);
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
async fn simulate_typing(text: String) -> Result<String, String> {
    println!("⌨️ [simulate_typing] Starting text simulation using rdev: '{}'", text);
    
    tokio::task::spawn_blocking(move || {
        use rdev::{simulate, EventType, SimulateError};
        use std::{thread, time};
        
        fn send(event_type: &EventType) -> Result<(), SimulateError> {
            let delay = time::Duration::from_millis(30);
            let result = simulate(event_type);
            thread::sleep(delay);
            result
        }
        
        // 文字列を1文字ずつシミュレート
        for ch in text.chars() {
            if let Some(key) = char_to_key(ch) {
                println!("🔑 [simulate_typing] Typing character: '{}'", ch);
                send(&EventType::KeyPress(key))
                    .map_err(|_| format!("Failed to press key for character: {}", ch))?;
                send(&EventType::KeyRelease(key))
                    .map_err(|_| format!("Failed to release key for character: {}", ch))?;
            } else {
                println!("⚠️ [simulate_typing] Unsupported character: '{}'", ch);
            }
        }
        
        println!("✅ [simulate_typing] Text simulation completed successfully");
        Ok(format!("Successfully typed: {}", text))
    }).await.map_err(|e| format!("Task error: {}", e))?
}

// 文字をrdevのKeyに変換する関数
fn char_to_key(ch: char) -> Option<Key> {
    match ch.to_ascii_lowercase() {
        'a' => Some(Key::KeyA),
        'b' => Some(Key::KeyB),
        'c' => Some(Key::KeyC),
        'd' => Some(Key::KeyD),
        'e' => Some(Key::KeyE),
        'f' => Some(Key::KeyF),
        'g' => Some(Key::KeyG),
        'h' => Some(Key::KeyH),
        'i' => Some(Key::KeyI),
        'j' => Some(Key::KeyJ),
        'k' => Some(Key::KeyK),
        'l' => Some(Key::KeyL),
        'm' => Some(Key::KeyM),
        'n' => Some(Key::KeyN),
        'o' => Some(Key::KeyO),
        'p' => Some(Key::KeyP),
        'q' => Some(Key::KeyQ),
        'r' => Some(Key::KeyR),
        's' => Some(Key::KeyS),
        't' => Some(Key::KeyT),
        'u' => Some(Key::KeyU),
        'v' => Some(Key::KeyV),
        'w' => Some(Key::KeyW),
        'x' => Some(Key::KeyX),
        'y' => Some(Key::KeyY),
        'z' => Some(Key::KeyZ),
        '0' => Some(Key::Num0),
        '1' => Some(Key::Num1),
        '2' => Some(Key::Num2),
        '3' => Some(Key::Num3),
        '4' => Some(Key::Num4),
        '5' => Some(Key::Num5),
        '6' => Some(Key::Num6),
        '7' => Some(Key::Num7),
        '8' => Some(Key::Num8),
        '9' => Some(Key::Num9),
        ' ' => Some(Key::Space),
        _ => None, // サポートされていない文字
    }
}

#[tauri::command]
async fn simulate_copy() -> Result<String, String> {
    println!("📋 [simulate_copy] Starting copy command simulation using rdev");
    
    tokio::task::spawn_blocking(|| {
        use rdev::{simulate, EventType, SimulateError};
        use std::{thread, time};
        
        fn send(event_type: &EventType) -> Result<(), SimulateError> {
            let delay = time::Duration::from_millis(50);
            let result = simulate(event_type);
            // OS同期のための待機（特にmacOS）
            thread::sleep(delay);
            result
        }
        
        println!("🔧 [simulate_copy] Using rdev for cross-platform key simulation");
        
        // プラットフォーム別のModifier key
        #[cfg(target_os = "macos")]
        let modifier = Key::MetaLeft; // macOS: Command key
        
        #[cfg(not(target_os = "macos"))]
        let modifier = Key::ControlLeft; // Windows/Linux: Ctrl key
        
        println!("🔑 [simulate_copy] Pressing modifier key");
        send(&EventType::KeyPress(modifier))
            .map_err(|_| "Failed to press modifier key".to_string())?;
        
        println!("🔑 [simulate_copy] Pressing C key");
        send(&EventType::KeyPress(Key::KeyC))
            .map_err(|_| "Failed to press C key".to_string())?;
        
        println!("🔑 [simulate_copy] Releasing C key");
        send(&EventType::KeyRelease(Key::KeyC))
            .map_err(|_| "Failed to release C key".to_string())?;
        
        println!("🔑 [simulate_copy] Releasing modifier key");
        send(&EventType::KeyRelease(modifier))
            .map_err(|_| "Failed to release modifier key".to_string())?;
        
        println!("✅ [simulate_copy] Copy command executed successfully");
        
        #[cfg(target_os = "macos")]
        return Ok("Successfully executed copy command (Cmd+C) via rdev".to_string());
        
        #[cfg(not(target_os = "macos"))]
        return Ok("Successfully executed copy command (Ctrl+C) via rdev".to_string());
    }).await.map_err(|e| format!("Task error: {}", e))?
}

#[tauri::command]
async fn simulate_paste() -> Result<String, String> {
    println!("📋 [simulate_paste] Starting paste command simulation using rdev");
    
    tokio::task::spawn_blocking(|| {
        use rdev::{simulate, EventType, SimulateError};
        use std::{thread, time};
        
        fn send(event_type: &EventType) -> Result<(), SimulateError> {
            let delay = time::Duration::from_millis(50);
            let result = simulate(event_type);
            // OS同期のための待機（特にmacOS）
            thread::sleep(delay);
            result
        }
        
        println!("🔧 [simulate_paste] Using rdev for cross-platform key simulation");
        
        // プラットフォーム別のModifier key
        #[cfg(target_os = "macos")]
        let modifier = Key::MetaLeft; // macOS: Command key
        
        #[cfg(not(target_os = "macos"))]
        let modifier = Key::ControlLeft; // Windows/Linux: Ctrl key
        
        println!("🔑 [simulate_paste] Pressing modifier key");
        send(&EventType::KeyPress(modifier))
            .map_err(|_| "Failed to press modifier key".to_string())?;
        
        println!("🔑 [simulate_paste] Pressing V key");
        send(&EventType::KeyPress(Key::KeyV))
            .map_err(|_| "Failed to press V key".to_string())?;
        
        println!("🔑 [simulate_paste] Releasing V key");
        send(&EventType::KeyRelease(Key::KeyV))
            .map_err(|_| "Failed to release V key".to_string())?;
        
        println!("🔑 [simulate_paste] Releasing modifier key");
        send(&EventType::KeyRelease(modifier))
            .map_err(|_| "Failed to release modifier key".to_string())?;
        
        println!("✅ [simulate_paste] Paste command executed successfully");
        
        #[cfg(target_os = "macos")]
        return Ok("Successfully executed paste command (Cmd+V) via rdev".to_string());
        
        #[cfg(not(target_os = "macos"))]
        return Ok("Successfully executed paste command (Ctrl+V) via rdev".to_string());
    }).await.map_err(|e| format!("Task error: {}", e))?
}

// キー録画開始
async fn start_key_recording(
    state: AppState,
    action_id: String,
    name: String,
    icon: Option<String>,
) -> Result<String, String> {
    let mut state_guard = state.lock().map_err(|_| "Failed to lock state".to_string())?;
    
    // 既に録画中の場合は停止
    if state_guard.recording_session.is_some() {
        return Err("Recording already in progress. Stop current recording first.".to_string());
    }
    
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "Failed to get system time")?
        .as_secs();
    
    // 録画セッション開始
    let session = RecordingSession {
        action_id: action_id.clone(),
        name: name.clone(),
        icon: icon.clone(),
        start_time: now,
        keys: Vec::new(),
    };
    
    state_guard.recording_session = Some(session);
    state_guard.key_listener_active = true;
    
    // キーリスナーを開始（別スレッドで）
    let state_clone = Arc::clone(&state);
    tokio::spawn(async move {
        key_listener_task(state_clone).await;
    });
    
    println!("🔴 Key recording started for action: {} ({})", name, action_id);
    Ok(format!("Key recording started for action: {}", name))
}

// キー録画停止
async fn stop_key_recording(
    state: AppState,
    action_id: String,
) -> Result<String, String> {
    let session = {
        let mut state_guard = state.lock().map_err(|_| "Failed to lock state".to_string())?;
        state_guard.key_listener_active = false;
        
        match state_guard.recording_session.take() {
            Some(session) if session.action_id == action_id => session,
            Some(_) => return Err("Different recording session is active".to_string()),
            None => return Err("No recording session active".to_string()),
        }
    };
    
    // 少し待って、最後のキーイベントをキャッチ
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
    
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "Failed to get system time")?
        .as_secs();
    
    // カスタムアクションを作成して保存
    let custom_action = CustomAction {
        id: session.action_id.clone(),
        name: session.name.clone(),
        icon: session.icon,
        key_sequence: session.keys,
        created_at: now,
    };
    
    // 状態に追加して保存
    {
        let mut state_guard = state.lock().map_err(|_| "Failed to lock state".to_string())?;
        state_guard.custom_actions.insert(session.action_id.clone(), custom_action.clone());
        
        // ディスクに保存
        // TODO: Implement save_custom_actions
        // if let Err(e) = save_custom_actions(&state_guard.custom_actions) {
        //     eprintln!("⚠️ Failed to save custom actions: {}", e);
        // }
    }
    
    println!("⏹️ Key recording stopped and saved for action: {} ({})", session.name, session.action_id);
    println!("📊 Recorded {} key events", custom_action.key_sequence.len());
    
    Ok(format!(
        "Key recording stopped. Recorded {} key events for action: {}",
        custom_action.key_sequence.len(),
        session.name
    ))
}

// キーリスナータスク（シンプルなモック実装）
async fn key_listener_task(state: AppState) {
    println!("🎧 Key listener task started");
    
    // シンプルなモック実装：実際のキーリスナーは後で実装
    // 今はダミーのキーシーケンスを作成する
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(1));
    let mut key_count = 0;
    
    loop {
        interval.tick().await;
        
        let should_stop = {
            if let Ok(mut state_guard) = state.lock() {
                if !state_guard.key_listener_active {
                    true
                } else if let Some(ref mut session) = state_guard.recording_session {
                    // ダミーキーシーケンスを追加
                    let now = SystemTime::now()
                        .duration_since(UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_millis() as u64;
                    let relative_time = now.saturating_sub(session.start_time * 1000);
                    
                    let dummy_key = RecordedKey {
                        key: format!("Key{}", char::from(65 + (key_count % 26))), // A-Z
                        event_type: "press".to_string(),
                        timestamp: relative_time,
                    };
                    
                    session.keys.push(dummy_key);
                    key_count += 1;
                    
                    println!("⬇️ Mock key recorded: Key{}", char::from(65 + ((key_count - 1) % 26)));
                    false
                } else {
                    true
                }
            } else {
                true
            }
        };
        
        if should_stop {
            println!("🔇 Key listener task stopping");
            break;
        }
    }
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
        .layer(CorsLayer::permissive())
        .with_state(Arc::clone(&state));

    let bind_addr = format!("0.0.0.0:{}", port);
    println!("🔗 Attempting to bind to: {}", bind_addr);
    
    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    println!("🚀 Side Assist Server successfully listening on http://localhost:{}", port);
    println!("🌐 Server accessible from network on port {}", port);
    println!("📱 Mobile endpoints:");
    println!("  - GET  /health - Health check with client tracking");
    println!("  - POST /input  - Unified action endpoint (requires password)");
    println!("  - POST /auth   - Authentication endpoint");
    
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
                    println!("🛑 Server shutdown requested, terminating...");
                    break;
                }
            }
        }
    });
    
    // どちらかのタスクが完了したら終了
    tokio::select! {
        result = server_task => {
            match result {
                Ok(Ok(())) => println!("✅ Server task completed successfully"),
                Ok(Err(e)) => println!("❌ Server task failed: {}", e),
                Err(e) => println!("❌ Server task panicked: {}", e),
            }
        }
        _ = monitor_task => {
            println!("🔍 Server monitor requested shutdown");
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
    println!("🏥 Health check request received");
    println!("📋 Headers: {:?}", headers.keys().collect::<Vec<_>>());
    
    let client_id = match headers.get("x-client-id").and_then(|h| h.to_str().ok()) {
        Some(id) => {
            println!("👤 Client ID: {}", id);
            id.to_string()
        },
        None => {
            println!("❌ Missing x-client-id header");
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
    
    println!("💓 Health check from {} - {} clients connected", client_id, client_count);
    
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
        println!("❌ Invalid or expired password provided");
            return Err(StatusCode::UNAUTHORIZED);
        }
    } else {
        println!("❌ No password provided");
        return Err(StatusCode::UNAUTHORIZED);
    }
    
    println!("🎯 Processing authenticated input action: {:?}", payload.action);
    
    // アクションタイプに基づいて処理を分岐
    let result = match &payload.action {
        ActionType::Text { text } => {
            println!("⌨️ Processing text input: '{}'", text);
            simulate_typing(text.clone()).await
        }
        ActionType::Copy => {
            println!("📋 Processing copy command");
            simulate_copy().await
        }
        ActionType::Paste => {
            println!("📋 Processing paste command");
            simulate_paste().await
        }
        ActionType::Custom { action_id } => {
            println!("🎭 Processing custom action: {}", action_id);
            let action = {
                let state_guard = state.lock().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
                state_guard.custom_actions.get(action_id).cloned()
            };
            
            if let Some(_action) = action {
                // TODO: Implement execute_custom_action
                Ok(format!("Mock execution of custom action: {}", action_id))
            } else {
                Err(format!("Custom action '{}' not found", action_id))
            }
        }
        ActionType::RecordStart { action_id, name, icon } => {
            println!("🔴 Starting key recording for action: {} ({})", name, action_id);
            start_key_recording(Arc::clone(&state), action_id.clone(), name.clone(), icon.clone()).await
        }
        ActionType::RecordStop { action_id } => {
            println!("⏹️ Stopping key recording for action: {}", action_id);
            stop_key_recording(Arc::clone(&state), action_id.clone()).await
        }
    };
    
    match result {
        Ok(message) => {
            println!("✅ Input processing complete");
            Ok(JsonResponse(ApiResponse {
                success: true,
                message,
            }))
        }
        Err(e) => {
            eprintln!("❌ Input processing failed: {}", e);
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
        println!("✅ Authentication successful");
        Ok(JsonResponse(ApiResponse {
            success: true,
            message: "Authentication successful".to_string(),
        }))
    } else {
        println!("❌ Authentication failed");
        Err(StatusCode::UNAUTHORIZED)
    }
}

async fn cleanup_inactive_clients(state: AppState) {
    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(30));
    
    loop {
        interval.tick().await;
        
        let now = match SystemTime::now().duration_since(UNIX_EPOCH) {
            Ok(duration) => duration.as_secs(),
            Err(_) => {
                eprintln!("Failed to get system time for cleanup");
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
                println!("🗑️ Removed inactive client: {}", client_id);
            }
            
            if !to_remove.is_empty() {
                println!("📊 Active clients: {}", state.connected_clients.len());
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
    
    println!("🚀 Side Assist Desktop starting up...");
    println!("📊 Initial server state: stopped, port {}", 8080);
    
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
            generate_qr_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
