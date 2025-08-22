use crate::keyboard::char_to_key;
use rdev::{simulate, EventType, SimulateError, Key};
use std::{thread, time};

/// キーイベント送信用のヘルパー関数
fn send(event_type: &EventType) -> Result<(), SimulateError> {
    let result = simulate(event_type);
    result
}

/// テキストタイピングシミュレーション関数
/// 
/// 指定されたテキストを1文字ずつキーボード入力としてシミュレートします。
/// 
/// # Arguments
/// 
/// * `text` - タイピングするテキスト
/// 
/// # Returns
/// 
/// * `Ok(String)` - 成功時のメッセージ
/// * `Err(String)` - エラー時のメッセージ
#[tauri::command]
pub async fn simulate_typing(text: String) -> Result<String, String> {
    println!("⌨️ [simulate_typing] Starting text simulation using rdev: '{}'", text);
    
    tokio::task::spawn_blocking(move || {
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

/// コピーコマンドシミュレーション関数
/// 
/// プラットフォーム別のコピーキーコンビネーション（Cmd+C/Ctrl+C）をシミュレートします。
/// 
/// # Returns
/// 
/// * `Ok(String)` - 成功時のメッセージ
/// * `Err(String)` - エラー時のメッセージ
#[tauri::command]
pub async fn simulate_copy() -> Result<String, String> {
    println!("📋 [simulate_copy] Starting copy command simulation using rdev");
    
    tokio::task::spawn_blocking(|| {
        fn send_copy(event_type: &EventType) -> Result<(), SimulateError> {
            let delay = time::Duration::from_millis(20);
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
        send_copy(&EventType::KeyPress(modifier))
            .map_err(|_| "Failed to press modifier key".to_string())?;
        
        println!("🔑 [simulate_copy] Pressing C key");
        send_copy(&EventType::KeyPress(Key::KeyC))
            .map_err(|_| "Failed to press C key".to_string())?;
        
        println!("🔑 [simulate_copy] Releasing C key");
        send_copy(&EventType::KeyRelease(Key::KeyC))
            .map_err(|_| "Failed to release C key".to_string())?;
        
        println!("🔑 [simulate_copy] Releasing modifier key");
        send_copy(&EventType::KeyRelease(modifier))
            .map_err(|_| "Failed to release modifier key".to_string())?;
        
        println!("✅ [simulate_copy] Copy command executed successfully");
        
        #[cfg(target_os = "macos")]
        return Ok("Successfully executed copy command (Cmd+C) via rdev".to_string());
        
        #[cfg(not(target_os = "macos"))]
        return Ok("Successfully executed copy command (Ctrl+C) via rdev".to_string());
    }).await.map_err(|e| format!("Task error: {}", e))?
}

/// ペーストコマンドシミュレーション関数
/// 
/// プラットフォーム別のペーストキーコンビネーション（Cmd+V/Ctrl+V）をシミュレートします。
/// 
/// # Returns
/// 
/// * `Ok(String)` - 成功時のメッセージ
/// * `Err(String)` - エラー時のメッセージ
#[tauri::command]
pub async fn simulate_paste() -> Result<String, String> {
    println!("📋 [simulate_paste] Starting paste command simulation using rdev");
    
    tokio::task::spawn_blocking(|| {
        fn send_paste(event_type: &EventType) -> Result<(), SimulateError> {
            let delay = time::Duration::from_millis(20);
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
        send_paste(&EventType::KeyPress(modifier))
            .map_err(|_| "Failed to press modifier key".to_string())?;
        
        println!("🔑 [simulate_paste] Pressing V key");
        send_paste(&EventType::KeyPress(Key::KeyV))
            .map_err(|_| "Failed to press V key".to_string())?;
        
        println!("🔑 [simulate_paste] Releasing V key");
        send_paste(&EventType::KeyRelease(Key::KeyV))
            .map_err(|_| "Failed to release V key".to_string())?;
        
        println!("🔑 [simulate_paste] Releasing modifier key");
        send_paste(&EventType::KeyRelease(modifier))
            .map_err(|_| "Failed to release modifier key".to_string())?;
        
        println!("✅ [simulate_paste] Paste command executed successfully");
        
        #[cfg(target_os = "macos")]
        return Ok("Successfully executed paste command (Cmd+V) via rdev".to_string());
        
        #[cfg(not(target_os = "macos"))]
        return Ok("Successfully executed paste command (Ctrl+V) via rdev".to_string());
    }).await.map_err(|e| format!("Task error: {}", e))?
}