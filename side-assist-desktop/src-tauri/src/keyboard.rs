use rdev::Key;

/// 文字列からrdev::Keyに変換する関数
///
/// 保存されたキー名文字列をrdev::Key列挙型に変換します。
///
/// # Arguments
///
/// * `key_str` - 変換するキー名文字列
///
/// # Returns
///
/// * `Some(Key)` - 変換成功時のrdev::Key
/// * `None` - サポートされていないキー文字列の場合
pub fn string_to_key(key_str: &str) -> Option<Key> {
    match key_str {
        "KeyA" => Some(Key::KeyA),
        "KeyB" => Some(Key::KeyB),
        "KeyC" => Some(Key::KeyC),
        "KeyD" => Some(Key::KeyD),
        "KeyE" => Some(Key::KeyE),
        "KeyF" => Some(Key::KeyF),
        "KeyG" => Some(Key::KeyG),
        "KeyH" => Some(Key::KeyH),
        "KeyI" => Some(Key::KeyI),
        "KeyJ" => Some(Key::KeyJ),
        "KeyK" => Some(Key::KeyK),
        "KeyL" => Some(Key::KeyL),
        "KeyM" => Some(Key::KeyM),
        "KeyN" => Some(Key::KeyN),
        "KeyO" => Some(Key::KeyO),
        "KeyP" => Some(Key::KeyP),
        "KeyQ" => Some(Key::KeyQ),
        "KeyR" => Some(Key::KeyR),
        "KeyS" => Some(Key::KeyS),
        "KeyT" => Some(Key::KeyT),
        "KeyU" => Some(Key::KeyU),
        "KeyV" => Some(Key::KeyV),
        "KeyW" => Some(Key::KeyW),
        "KeyX" => Some(Key::KeyX),
        "KeyY" => Some(Key::KeyY),
        "KeyZ" => Some(Key::KeyZ),
        "Num0" => Some(Key::Num0),
        "Num1" => Some(Key::Num1),
        "Num2" => Some(Key::Num2),
        "Num3" => Some(Key::Num3),
        "Num4" => Some(Key::Num4),
        "Num5" => Some(Key::Num5),
        "Num6" => Some(Key::Num6),
        "Num7" => Some(Key::Num7),
        "Num8" => Some(Key::Num8),
        "Num9" => Some(Key::Num9),
        "Space" => Some(Key::Space),
        "MetaLeft" => Some(Key::MetaLeft),
        "MetaRight" => Some(Key::MetaRight),
        "ControlLeft" => Some(Key::ControlLeft),
        "ControlRight" => Some(Key::ControlRight),
        "ShiftLeft" => Some(Key::ShiftLeft),
        "ShiftRight" => Some(Key::ShiftRight),
        "Alt" => Some(Key::Alt),
        "AltLeft" => Some(Key::Alt),    // Left Alt key
        "AltRight" => Some(Key::AltGr), // Right Alt key (AltGr)
        "Enter" => Some(Key::Return),
        "Escape" => Some(Key::Escape),
        "Backspace" => Some(Key::Backspace),
        "Tab" => Some(Key::Tab),
        _ => None,
    }
}

/// 文字をrdev::Keyに変換する関数
///
/// 入力文字をrdev::Key列挙型に変換します。大文字小文字は区別しません。
///
/// # Arguments
///
/// * `ch` - 変換する文字
///
/// # Returns
///
/// * `Some(Key)` - 変換成功時のrdev::Key
/// * `None` - サポートされていない文字の場合
pub fn char_to_key(ch: char) -> Option<Key> {
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

/// rdev::Keyを文字列に変換する関数
///
/// rdev::Key列挙型を対応する文字列に変換します。
///
/// # Arguments
///
/// * `key` - 変換するrdev::Key
///
/// # Returns
///
/// * `String` - 対応する文字列名
pub fn key_to_string(key: Key) -> String {
    match key {
        Key::KeyA => "KeyA".to_string(),
        Key::KeyB => "KeyB".to_string(),
        Key::KeyC => "KeyC".to_string(),
        Key::KeyD => "KeyD".to_string(),
        Key::KeyE => "KeyE".to_string(),
        Key::KeyF => "KeyF".to_string(),
        Key::KeyG => "KeyG".to_string(),
        Key::KeyH => "KeyH".to_string(),
        Key::KeyI => "KeyI".to_string(),
        Key::KeyJ => "KeyJ".to_string(),
        Key::KeyK => "KeyK".to_string(),
        Key::KeyL => "KeyL".to_string(),
        Key::KeyM => "KeyM".to_string(),
        Key::KeyN => "KeyN".to_string(),
        Key::KeyO => "KeyO".to_string(),
        Key::KeyP => "KeyP".to_string(),
        Key::KeyQ => "KeyQ".to_string(),
        Key::KeyR => "KeyR".to_string(),
        Key::KeyS => "KeyS".to_string(),
        Key::KeyT => "KeyT".to_string(),
        Key::KeyU => "KeyU".to_string(),
        Key::KeyV => "KeyV".to_string(),
        Key::KeyW => "KeyW".to_string(),
        Key::KeyX => "KeyX".to_string(),
        Key::KeyY => "KeyY".to_string(),
        Key::KeyZ => "KeyZ".to_string(),
        Key::Num0 => "Num0".to_string(),
        Key::Num1 => "Num1".to_string(),
        Key::Num2 => "Num2".to_string(),
        Key::Num3 => "Num3".to_string(),
        Key::Num4 => "Num4".to_string(),
        Key::Num5 => "Num5".to_string(),
        Key::Num6 => "Num6".to_string(),
        Key::Num7 => "Num7".to_string(),
        Key::Num8 => "Num8".to_string(),
        Key::Num9 => "Num9".to_string(),
        Key::Space => "Space".to_string(),
        Key::MetaLeft => "MetaLeft".to_string(),
        Key::MetaRight => "MetaRight".to_string(),
        Key::ControlLeft => "ControlLeft".to_string(),
        Key::ControlRight => "ControlRight".to_string(),
        Key::ShiftLeft => "ShiftLeft".to_string(),
        Key::ShiftRight => "ShiftRight".to_string(),
        Key::Alt => "Alt".to_string(),
        Key::AltGr => "AltLeft".to_string(),
        Key::Return => "Enter".to_string(),
        Key::Escape => "Escape".to_string(),
        Key::Backspace => "Backspace".to_string(),
        Key::Tab => "Tab".to_string(),
        _ => format!("{:?}", key), // Fallback for unsupported keys
    }
}

/// 修飾キーかどうかを判定する関数
///
/// 指定されたキーが修飾キー（Alt, Ctrl, Shift, Meta）かどうかを判定します。
///
/// # Arguments
///
/// * `key` - 判定するrdev::Key
///
/// # Returns
///
/// * `bool` - 修飾キーの場合true
pub fn is_modifier_key(key: Key) -> bool {
    matches!(
        key,
        Key::Alt
            | Key::AltGr
            | Key::ControlLeft
            | Key::ControlRight
            | Key::ShiftLeft
            | Key::ShiftRight
            | Key::MetaLeft
            | Key::MetaRight
    )
}

/// rdev::Keyから修飾キーの種類を取得する関数
///
/// 指定されたキーがどの修飾キーかを判定し、対応する文字列を返します。
///
/// # Arguments
///
/// * `key` - 判定するrdev::Key
///
/// # Returns
///
/// * `Option<&'static str>` - 修飾キーの種類（"alt", "ctrl", "shift", "meta"）
pub fn get_modifier_type(key: Key) -> Option<&'static str> {
    match key {
        Key::Alt | Key::AltGr => Some("alt"),
        Key::ControlLeft | Key::ControlRight => Some("ctrl"),
        Key::ShiftLeft | Key::ShiftRight => Some("shift"),
        Key::MetaLeft | Key::MetaRight => Some("meta"),
        _ => None,
    }
}
