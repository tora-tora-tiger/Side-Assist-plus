import * as Linking from "expo-linking";

export interface ConnectionParams {
  ip: string;
  port: string;
  password: string;
}

export class DeepLinkService {
  private static listeners: Array<(params: ConnectionParams) => void> = [];

  static initialize() {
    // アプリが既に起動している場合のURL処理
    const subscription = Linking.addEventListener("url", this.handleURL);

    // アプリが起動していない場合の初期URL取得
    Linking.getInitialURL().then(url => {
      if (url) {
        this.handleURL({ url });
      }
    });

    return subscription;
  }

  static cleanup() {
    this.listeners = [];
  }

  static addListener(callback: (params: ConnectionParams) => void) {
    this.listeners.push(callback);
  }

  static removeListener(callback: (params: ConnectionParams) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private static handleURL = (event: { url: string }) => {
    const params = this.parseConnectionURL(event.url);
    if (params) {
      this.listeners.forEach(listener => listener(params));
    }
  };

  static parseConnectionURL(url: string): ConnectionParams | null {
    try {
      console.log(
        "🔧 [DEBUG] URL char codes:",
        url.split("").map(c => c.charCodeAt(0)),
      );

      // URLの改行や空白を除去
      const cleanUrl = url
        .trim()
        .replace(/\s+/g, "")
        .replace(/[\r\n\t]/g, "");

      console.log(
        "🔧 [DEBUG] URL change detected:",
        url !== cleanUrl ? "YES" : "NO",
      );

      // 基本的なURL形式チェック
      if (!cleanUrl.startsWith("sideassist://connect")) {
        return null;
      }

      // React Nativeでのカスタムスキーム対応: 手動でURLを解析
      // sideassist://connect?ip=192.168.1.100&port=8080&password=12345
      const queryStart = cleanUrl.indexOf("?");
      if (queryStart === -1) {
        return null;
      }

      const queryString = cleanUrl.substring(queryStart + 1);

      // 手動でパラメータを解析
      const params = new URLSearchParams(queryString);
      const ip = params.get("ip");
      const port = params.get("port");
      const password = params.get("password");

      // Process all URL parameters if needed in the future
      // for (const [key, value] of params.entries()) { ... }

      console.log("🔧 [DEBUG] Extracted parameters:", {
        ip: ip ? `'${ip}' (${ip.length})` : "NULL",
        port: port ? `'${port}' (${port.length})` : "NULL",
        password: password ? `'${password}' (${password.length})` : "NULL",
        allParams: Object.fromEntries(params.entries()),
      });

      // 必須パラメータをチェック
      if (!ip || !port || !password) {
        console.log("❌ Missing required parameters:", {
          ip: ip === null ? "NULL" : ip === undefined ? "UNDEFINED" : `"${ip}"`,
          port:
            port === null
              ? "NULL"
              : port === undefined
                ? "UNDEFINED"
                : `"${port}"`,
          password:
            password === null
              ? "NULL"
              : password === undefined
                ? "UNDEFINED"
                : `"${password}"`,
          url,
        });
        return null;
      }

      // IPアドレスの簡単な検証

      if (!this.isValidIP(ip)) {
        return null;
      }

      // ポート番号の検証

      const portNumber = parseInt(port, 10);
      if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
        return null;
      }

      // パスワードの検証（5桁の数字）

      if (!/^\d{5}$/.test(password)) {
        console.log(
          "❌ Password chars:",
          password.split("").map(c => `'${c}' (${c.charCodeAt(0)})`),
        );
        return null;
      }

      return { ip, port, password };
    } catch (error) {
      console.error("❌ Error parsing connection URL:", error);
      return null;
    }
  }

  private static isValidIP(ip: string): boolean {
    // 簡単なIPアドレス検証（IPv4）
    const parts = ip.split(".");

    if (parts.length !== 4) {
      return false;
    }

    const isValid = parts.every((part, index) => {
      const num = parseInt(part, 10);
      const valid = !isNaN(num) && num >= 0 && num <= 255;
      console.log(
        `🔧 [DEBUG] Part ${index}: '${part}' -> ${num} (valid: ${valid})`,
      );
      return valid;
    });

    return isValid;
  }

  // 手動でのURL処理（テスト用）
  static handleManualURL(url: string): ConnectionParams | null {
    return this.parseConnectionURL(url);
  }
}
