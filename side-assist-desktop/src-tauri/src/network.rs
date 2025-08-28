use std::net::UdpSocket;

/// ローカルIPアドレスを取得する関数
///
/// 複数の方法を試して、実際に使用されているローカルIPアドレスを取得します。
///
/// # Returns
///
/// * `Some(String)` - ローカルIPアドレス文字列
/// * `None` - IPアドレスを取得できなかった場合
pub fn get_local_ip_address() -> Option<String> {
    // 最も確実な方法：UDP socket を使って外部に接続し、実際のローカルIPを取得
    if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(addr) = socket.local_addr() {
                let ip = addr.ip().to_string();

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

                    return Some(ip);
                }
            }
        }
    }

    None
}
