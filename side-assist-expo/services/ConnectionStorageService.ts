import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 保存される接続情報の型定義
export interface StoredConnectionInfo {
  ip: string;
  port: string;
  password: string;
  lastConnectedAt: number;
  autoReconnect: boolean;
}

// 非暗号化情報の型定義（IP/ポートなど）
interface ConnectionMetadata {
  ip: string;
  port: string;
  lastConnectedAt: number;
  autoReconnect: boolean;
}

export class ConnectionStorageService {
  private static readonly SECURE_KEY_PASSWORD = "side_assist_password";
  private static readonly STORAGE_KEY_METADATA =
    "side_assist_connection_metadata";

  /**
   * 接続情報を保存
   */
  static async saveConnectionInfo(
    connectionInfo: StoredConnectionInfo,
  ): Promise<boolean> {
    try {
      // パスワードをSecureStoreに暗号化保存
      await SecureStore.setItemAsync(
        this.SECURE_KEY_PASSWORD,
        connectionInfo.password,
      );

      // その他の情報をAsyncStorageに保存
      const metadata: ConnectionMetadata = {
        ip: connectionInfo.ip,
        port: connectionInfo.port,
        lastConnectedAt: connectionInfo.lastConnectedAt,
        autoReconnect: connectionInfo.autoReconnect,
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEY_METADATA,
        JSON.stringify(metadata),
      );

      console.log(
        `📍 [ConnectionStorage] Saved: ${metadata.ip}:${metadata.port}`,
      );
      return true;
    } catch (error) {
      console.error(
        "❌ [ConnectionStorage] Failed to save connection info:",
        error,
      );
      return false;
    }
  }

  /**
   * 保存された接続情報を読み込み
   */
  static async loadConnectionInfo(): Promise<StoredConnectionInfo | null> {
    try {
      // メタデータを読み込み
      const metadataJson = await AsyncStorage.getItem(
        this.STORAGE_KEY_METADATA,
      );
      if (!metadataJson) {
        console.log(
          "ℹ️ [ConnectionStorage] No saved connection metadata found",
        );
        return null;
      }

      const metadata: ConnectionMetadata = JSON.parse(metadataJson);

      // パスワードを読み込み
      const password = await SecureStore.getItemAsync(this.SECURE_KEY_PASSWORD);
      if (!password) {
        console.log(
          "⚠️ [ConnectionStorage] Metadata found but no password - clearing metadata",
        );
        await this.clearConnectionInfo();
        return null;
      }

      const connectionInfo: StoredConnectionInfo = {
        ip: metadata.ip,
        port: metadata.port,
        password,
        lastConnectedAt: metadata.lastConnectedAt,
        autoReconnect: metadata.autoReconnect,
      };

      console.log(
        `📍 [ConnectionStorage] Loaded: ${connectionInfo.ip}:${connectionInfo.port}`,
      );
      console.log(
        `⏰ [ConnectionStorage] Last connected: ${new Date(connectionInfo.lastConnectedAt).toLocaleString()}`,
      );

      return connectionInfo;
    } catch (error) {
      console.error(
        "❌ [ConnectionStorage] Failed to load connection info:",
        error,
      );
      return null;
    }
  }

  /**
   * 保存された接続情報を削除
   */
  static async clearConnectionInfo(): Promise<boolean> {
    try {
      // パスワードを削除
      await SecureStore.deleteItemAsync(this.SECURE_KEY_PASSWORD);

      // メタデータを削除
      await AsyncStorage.removeItem(this.STORAGE_KEY_METADATA);

      console.log(
        "✅ [ConnectionStorage] Connection info cleared successfully",
      );
      return true;
    } catch (error) {
      console.error(
        "❌ [ConnectionStorage] Failed to clear connection info:",
        error,
      );
      return false;
    }
  }

  /**
   * 保存された接続情報があるかチェック
   */
  static async hasStoredConnection(): Promise<boolean> {
    try {
      const metadataJson = await AsyncStorage.getItem(
        this.STORAGE_KEY_METADATA,
      );
      const hasPassword = await SecureStore.getItemAsync(
        this.SECURE_KEY_PASSWORD,
      );

      const hasConnection = metadataJson !== null && hasPassword !== null;
      console.log(
        `🔍 [ConnectionStorage] Has stored connection: ${hasConnection}`,
      );

      return hasConnection;
    } catch (error) {
      console.error(
        "❌ [ConnectionStorage] Failed to check stored connection:",
        error,
      );
      return false;
    }
  }

  /**
   * 最終接続時刻を更新
   */
  static async updateLastConnectedTime(): Promise<boolean> {
    try {
      const metadataJson = await AsyncStorage.getItem(
        this.STORAGE_KEY_METADATA,
      );
      if (!metadataJson) {
        return false;
      }

      const metadata: ConnectionMetadata = JSON.parse(metadataJson);
      metadata.lastConnectedAt = Date.now();

      await AsyncStorage.setItem(
        this.STORAGE_KEY_METADATA,
        JSON.stringify(metadata),
      );

      return true;
    } catch (error) {
      console.error(
        "❌ [ConnectionStorage] Failed to update last connected time:",
        error,
      );
      return false;
    }
  }

  /**
   * 自動再接続設定を更新
   */
  static async updateAutoReconnect(autoReconnect: boolean): Promise<boolean> {
    console.log(
      `🔄 [ConnectionStorage] Updating auto reconnect: ${autoReconnect}`,
    );

    try {
      const metadataJson = await AsyncStorage.getItem(
        this.STORAGE_KEY_METADATA,
      );
      if (!metadataJson) {
        return false;
      }

      const metadata: ConnectionMetadata = JSON.parse(metadataJson);
      metadata.autoReconnect = autoReconnect;

      await AsyncStorage.setItem(
        this.STORAGE_KEY_METADATA,
        JSON.stringify(metadata),
      );

      return true;
    } catch (error) {
      console.error(
        "❌ [ConnectionStorage] Failed to update auto reconnect:",
        error,
      );
      return false;
    }
  }
}
