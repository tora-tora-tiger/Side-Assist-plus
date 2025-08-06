import Constants from 'expo-constants';
import * as Device from 'expo-device';

export interface DeviceConfigType {
  deviceName: string;
  debugMode: boolean;
  developmentMode: boolean;
}

/**
 * デバイス設定を取得する
 * Get device configuration from environment variables and device info
 */
export const getDeviceConfig = (): DeviceConfigType => {
  // .envファイルの設定を取得
  const envDeviceName = Constants.expoConfig?.extra?.deviceName;
  const envDebugMode = Constants.expoConfig?.extra?.debugMode || false;
  const envDevelopmentMode = Constants.expoConfig?.extra?.developmentMode || __DEV__;

  // デバイス名を決定 (優先順位: .env > デバイス名 > デフォルト)
  const deviceName = envDeviceName || Device.deviceName || `${Device.brand} ${Device.modelName}` || 'Unknown Device';

  return {
    deviceName,
    debugMode: envDebugMode,
    developmentMode: envDevelopmentMode,
  };
};

/**
 * 環境変数からデバイス名を取得
 * Get device name from environment variable
 */
export const getConfiguredDeviceName = (): string | null => {
  return Constants.expoConfig?.extra?.deviceName || null;
};

/**
 * デバッグモードが有効かどうか
 * Check if debug mode is enabled
 */
export const isDebugModeEnabled = (): boolean => {
  return Constants.expoConfig?.extra?.debugMode || false;
};

/**
 * 開発モードが有効かどうか
 * Check if development mode is enabled
 */
export const isDevelopmentModeEnabled = (): boolean => {
  return Constants.expoConfig?.extra?.developmentMode || __DEV__;
};

// デフォルトエクスポート
export default {
  getDeviceConfig,
  getConfiguredDeviceName,
  isDebugModeEnabled,
  isDevelopmentModeEnabled,
};