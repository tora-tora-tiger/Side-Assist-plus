import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { keyboardService } from '../services/keyboardService';
import { permissionConfig } from '../config/permissions';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const useKeyboardTest = (
  hasAccessibilityPermission: boolean | null,
  onLog: (message: string, type: LogEntry['type']) => void
) => {
  const { t } = useTranslation();
  const [testResult, setTestResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const testTyping = useCallback(async (text: string) => {
    // アクセシビリティ権限チェック（設定で無効にされている場合はスキップ）
    if (permissionConfig.disableKeyboardWhenDenied && hasAccessibilityPermission === false) {
      setTestResult('アクセシビリティ権限が必要です。権限を許可してください。');
      return;
    }
    
    try {
      setIsLoading(true);
      setTestResult(t('keyboard.testing'));
      const result = await keyboardService.simulateTyping(text);
      setTestResult(result);
      onLog(`${t('activity.keyboardTestPrefix')}: "${text}"`, 'success');
    } catch (error) {
      console.error("Failed to test typing:", error);
      setTestResult(`${t('messages.failed')}: ${error}`);
      onLog(`${t('activity.keyboardTestFailed')}: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [hasAccessibilityPermission, onLog, t]);

  return {
    testResult,
    isLoading,
    testTyping
  };
};