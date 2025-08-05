import { useState, useEffect, useCallback } from 'react';
import { 
  checkAccessibilityPermission, 
  requestAccessibilityPermission 
} from "tauri-plugin-macos-permissions-api";
import { invoke } from "@tauri-apps/api/core";
import { PermissionConfig } from '../config/permissions';

interface UsePermissionsReturn {
  hasAccessibilityPermission: boolean | null;
  isLoading: boolean;
  checkPermissions: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  openSystemPreferences: () => Promise<void>;
}

export const usePermissions = (
  config: PermissionConfig,
  onLog?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
): UsePermissionsReturn => {
  const [hasAccessibilityPermission, setHasAccessibilityPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoggedPermissionStatus, setHasLoggedPermissionStatus] = useState(false);

  const checkPermissions = useCallback(async (): Promise<boolean> => {
    if (!config.enabled) {
      setHasAccessibilityPermission(true);
      return true;
    }

    try {
      // プラグインを使って権限をチェック
      const hasPermission = await checkAccessibilityPermission() as boolean;
      
      console.log('Permission check result:', hasPermission);
      setHasAccessibilityPermission(hasPermission);
      
      if (config.logPermissionStatus && onLog && !hasLoggedPermissionStatus) {
        if (!hasPermission) {
          onLog('⚠️ アクセシビリティ権限が未許可です', 'warning');
        } else {
          onLog('✅ アクセシビリティ権限が許可されています', 'success');
        }
        setHasLoggedPermissionStatus(true);
      }
      
      return hasPermission;
    } catch (error) {
      console.error("Failed to check accessibility permission:", error);
      
      // エラーの場合はRustコマンドでも確認を試行
      try {
        const rustResult = await invoke<boolean>("check_accessibility_permission");
        console.log('Rust permission check result:', rustResult);
        setHasAccessibilityPermission(rustResult);
        
        if (config.logPermissionStatus && onLog && !hasLoggedPermissionStatus) {
          if (!rustResult) {
            onLog('⚠️ アクセシビリティ権限が未許可です', 'warning');
          } else {
            onLog('✅ アクセシビリティ権限が許可されています', 'success');
          }
          setHasLoggedPermissionStatus(true);
        }
        
        return rustResult;
      } catch (rustError) {
        console.error("Rust permission check also failed:", rustError);
        
        // macOS以外、または全てのチェックが失敗した場合は null を設定
        setHasAccessibilityPermission(null);
        
        if (config.logPermissionStatus && onLog && !hasLoggedPermissionStatus) {
          onLog('❓ 権限状態を取得できませんでした', 'error');
          setHasLoggedPermissionStatus(true);
        }
        
        return false;
      }
    }
  }, [config.enabled, config.logPermissionStatus, onLog, hasLoggedPermissionStatus]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!config.enabled) {
      return true;
    }

    try {
      setIsLoading(true);
      if (config.logPermissionStatus && onLog) {
        onLog('アクセシビリティ権限を要求中...', 'info');
      }
      
      const granted = await requestAccessibilityPermission() as boolean;
      setHasAccessibilityPermission(granted);
      
      if (config.logPermissionStatus && onLog) {
        if (granted) {
          onLog('アクセシビリティ権限が許可されました', 'success');
        } else {
          onLog('アクセシビリティ権限が拒否されました。システム環境設定で手動で許可してください。', 'warning');
        }
      }
      
      return granted;
    } catch (error) {
      console.error("Failed to request accessibility permission:", error);
      if (onLog) {
        onLog(`権限要求エラー: ${error}`, 'error');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [config.enabled, config.logPermissionStatus, onLog]);

  const openSystemPreferences = useCallback(async (): Promise<void> => {
    try {
      if (onLog) {
        onLog('🔧 システム環境設定を開いています...', 'info');
      }
      
      // macOSのシステム環境設定（アクセシビリティ）を開く
      await invoke("open_system_preferences");
      
      if (onLog) {
        onLog('💡 システム環境設定でSide Assistにアクセシビリティ権限を許可してください', 'info');
      }
    } catch (error) {
      console.error("Failed to open system preferences:", error);
      if (onLog) {
        onLog(`システム環境設定を開けませんでした: ${error}`, 'error');
      }
    }
  }, [onLog]);

  useEffect(() => {
    if (config.autoCheckOnStartup) {
      checkPermissions();
    }
  }, [config.autoCheckOnStartup, checkPermissions]);

  return {
    hasAccessibilityPermission,
    isLoading,
    checkPermissions,
    requestPermissions,
    openSystemPreferences,
  };
};