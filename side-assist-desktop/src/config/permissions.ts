// アクセシビリティ権限設定
export interface PermissionConfig {
  // 権限チェック機能を有効にするか
  enabled: boolean;
  
  // 権限リクエストボタンを表示するか
  showRequestButton: boolean;
  
  // 権限ステータスバナーを表示するか
  showStatusBanner: boolean;
  
  // 権限未許可時にキーボードテストを無効にするか
  disableKeyboardWhenDenied: boolean;
  
  // 起動時に自動で権限チェックするか
  autoCheckOnStartup: boolean;
  
  // ログに権限状態を出力するか
  logPermissionStatus: boolean;
}

// 固定設定（環境変数機能を廃止）
export const permissionConfig: PermissionConfig = {
  enabled: true,
  showRequestButton: true,
  showStatusBanner: true,
  disableKeyboardWhenDenied: true,
  autoCheckOnStartup: true,
  logPermissionStatus: true,
};