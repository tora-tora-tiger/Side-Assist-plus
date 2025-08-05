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
use enigo::{Enigo, Keyboard, Settings};
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

type AppState = Arc<Mutex<ServerState>>;

#[derive(Clone, Debug)]
pub struct ServerState {
    pub running: bool,
    pub connected_clients: HashMap<String, ClientInfo>,
    pub port: u16,
    pub one_time_password: Option<String>,
    pub password_expiry: Option<u64>,
}

impl Default for ServerState {
    fn default() -> Self {
        Self {
            running: false,
            connected_clients: HashMap::new(),
            port: 8080,
            one_time_password: None,
            password_expiry: None,
        }
    }
}

#[derive(Deserialize)]
struct InputRequest {
    text: String,
    password: Option<String>,
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
async fn start_server(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let app_state = Arc::clone(&state);
    
    {
        let mut state = app_state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        if state.running {
            return Ok("Server is already running".to_string());
        }
        state.running = true;
    }

    let server_state = Arc::clone(&app_state);
    let error_state = Arc::clone(&app_state);
    tokio::spawn(async move {
        if let Err(e) = run_http_server(server_state).await {
            eprintln!("Server error: {}", e);
            if let Ok(mut state) = error_state.lock() {
                state.running = false;
            }
        }
    });

    // Start client cleanup task
    let cleanup_state = Arc::clone(&app_state);
    tokio::spawn(async move {
        cleanup_inactive_clients(cleanup_state).await;
    });

    let port = {
        let state_guard = app_state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        state_guard.port
    };
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
    tokio::task::spawn_blocking(move || {
        let mut enigo = Enigo::new(&Settings::default()).map_err(|e| format!("Failed to create Enigo: {}", e))?;
        
        // Use simple text input instead of individual key presses
        enigo.text(&text).map_err(|e| format!("Failed to type text: {}", e))?;
        
        Ok(format!("Successfully typed: {}", text))
    }).await.map_err(|e| format!("Task error: {}", e))?
}

async fn run_http_server(state: AppState) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let port = {
        let state_guard = state.lock().map_err(|e| format!("Failed to lock state: {}", e))?;
        state_guard.port
    };

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/input", post(handle_input))
        .route("/type", post(handle_input))  // モバイルアプリとの互換性のため
        .route("/auth", post(handle_auth))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let bind_addr = format!("0.0.0.0:{}", port);
    println!("🔗 Attempting to bind to: {}", bind_addr);
    
    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    println!("🚀 Side Assist Server successfully listening on http://localhost:{}", port);
    println!("🌐 Server accessible from network on port {}", port);
    println!("📱 Mobile endpoints:");
    println!("  - GET  /health - Health check with client tracking");
    println!("  - POST /input  - Keyboard input simulation (requires password)");
    println!("  - POST /type   - Keyboard input simulation (mobile compatibility, requires password)");
    println!("  - POST /auth   - Authentication endpoint");
    
    axum::serve(listener, app).await?;
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
    
    println!("⌨️ Processing authenticated keyboard input: '{}'", payload.text);
    
    match simulate_typing(payload.text.clone()).await {
        Ok(_) => {
            println!("✅ Keyboard simulation complete");
            Ok(JsonResponse(ApiResponse {
                success: true,
                message: "Text input successful".to_string(),
            }))
        }
        Err(e) => {
            eprintln!("❌ Keyboard simulation failed: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
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
    let state = Arc::new(Mutex::new(ServerState::default()));
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_macos_permissions::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            get_server_status,
            start_server,
            simulate_typing,
            check_accessibility_permission,
            open_system_preferences,
            generate_one_time_password,
            get_current_password,
            generate_qr_code
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
