use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

// lib.rsで定義された型を一時的に参照
// 後の段階でこれらの型もここに移動予定

/// カスタムアクション保存ファイルのパスを取得する関数
/// 
/// プラットフォーム別のアプリケーションデータディレクトリを取得し、
/// カスタムアクションの保存ファイルパスを返します。
/// 
/// # Returns
/// 
/// * `Ok(PathBuf)` - カスタムアクション保存ファイルのパス
/// * `Err(String)` - ディレクトリの取得または作成に失敗した場合のエラー
pub fn get_custom_actions_file_path() -> Result<PathBuf, String> {
    // アプリケーション固有のデータディレクトリを取得
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

    // ディレクトリが存在しない場合は作成
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
        
    }

    Ok(app_data_dir.join("custom_actions.json"))
}

/// カスタムアクションをファイルに保存する関数
/// 
/// 指定されたカスタムアクションのHashMapをJSON形式でファイルに保存します。
/// 
/// # Arguments
/// 
/// * `actions` - 保存するカスタムアクションのHashMap
/// 
/// # Returns
/// 
/// * `Ok(())` - 保存が成功した場合
/// * `Err(String)` - 保存に失敗した場合のエラーメッセージ
pub async fn save_custom_actions(actions: &HashMap<String, crate::CustomAction>) -> Result<(), String> {
    let file_path = get_custom_actions_file_path()?;
    
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| "Failed to get current time")?
        .as_secs();

    let storage = crate::CustomActionsStorage {
        actions: actions.values().cloned().collect(),
        version: 1,
        last_updated: now,
    };

    let json_content = serde_json::to_string_pretty(&storage)
        .map_err(|e| format!("Failed to serialize custom actions: {}", e))?;

    // 非同期的にファイルに書き込み
    tokio::fs::write(&file_path, json_content).await
        .map_err(|e| format!("Failed to write custom actions to file: {}", e))?;

    
    Ok(())
}

/// カスタムアクションをファイルから読み込む関数
/// 
/// 保存されたJSON形式のカスタムアクションファイルを読み込み、
/// HashMap形式で返します。
/// 
/// # Returns
/// 
/// * `Ok(HashMap<String, CustomAction>)` - 読み込んだカスタムアクションのHashMap
/// * `Err(String)` - 読み込みに失敗した場合のエラーメッセージ
pub async fn load_custom_actions() -> Result<HashMap<String, crate::CustomAction>, String> {
    let file_path = get_custom_actions_file_path()?;
    
    // ファイルが存在しない場合は空のHashMapを返す
    if !file_path.exists() {
        
        return Ok(HashMap::new());
    }

    // ファイル内容を非同期的に読み込み
    let json_content = tokio::fs::read_to_string(&file_path).await
        .map_err(|e| format!("Failed to read custom actions file: {}", e))?;

    let storage: crate::CustomActionsStorage = serde_json::from_str(&json_content)
        .map_err(|e| format!("Failed to parse custom actions file: {}", e))?;

    let mut actions_map = HashMap::new();
    for action in storage.actions {
        actions_map.insert(action.id.clone(), action);
    }

    
    Ok(actions_map)
}