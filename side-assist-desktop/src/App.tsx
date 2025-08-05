import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from 'react-i18next';
import { permissionConfig } from './config/permissions';
import { usePermissions } from './hooks/usePermissions';
import { AppHeader } from './components/AppHeader';
import { ServerStatus } from './components/ServerStatus';
import { ConnectionPanel } from './components/ConnectionPanel';
import { KeyboardTest } from './components/KeyboardTest';
import { ActivityLog } from './components/ActivityLog';
import { PermissionBanner } from './components/PermissionBanner';
import { PermissionStatus } from './components/PermissionStatus';
import "./App.css";

interface ServerStatusType {
  running: boolean;
  connected_clients: number;
  port: number;
}

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

function App() {
  const { t, i18n } = useTranslation();
  const [serverStatus, setServerStatus] = useState<ServerStatusType>({
    running: false,
    connected_clients: 0,
    port: 8080
  });
  const [testResult, setTestResult] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [oneTimePassword, setOneTimePassword] = useState<string | null>(null);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      time: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-9), newLog]); // Keep last 10 logs
  };

  // 権限管理フック
  const {
    hasAccessibilityPermission,
    isLoading: isPermissionLoading,
    checkPermissions,
    requestPermissions,
    openSystemPreferences,
  } = usePermissions(permissionConfig, addLog);

  const refreshServerStatus = async () => {
    try {
      const status = await invoke<ServerStatusType>("get_server_status");
      setServerStatus(status);
    } catch (error) {
      console.error("Failed to get server status:", error);
      addLog(t('activity.failedToGetServerStatus'), 'error');
    }
  };

  const startServer = async () => {
    try {
      setIsLoading(true);
      const result = await invoke<string>("start_server");
      addLog(result, 'success');
      await refreshServerStatus();
    } catch (error) {
      console.error("Failed to start server:", error);
      addLog(`${t('activity.failedToStartServer')}: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateOneTimePassword = async () => {
    try {
      setIsGeneratingPassword(true);
      const password = await invoke<string>("generate_one_time_password");
      setOneTimePassword(password);
      addLog(`新しいワンタイムパスワードを生成しました: ${password}`, 'success');
      
      // パスワード生成後、自動的にQRコードも生成
      generateQRCode();
    } catch (error) {
      console.error("Failed to generate password:", error);
      addLog(`パスワード生成に失敗しました: ${error}`, 'error');
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      const qrCode = await invoke<string>("generate_qr_code");
      setQrCodeImage(qrCode);
      addLog('QRコードを生成しました', 'success');
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      addLog(`QRコード生成に失敗しました: ${error}`, 'error');
      setQrCodeImage(null);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const checkCurrentPassword = async () => {
    try {
      const password = await invoke<string | null>("get_current_password");
      setOneTimePassword(password);
    } catch (error) {
      console.error("Failed to get current password:", error);
    }
  };

  const testTyping = async (text: string) => {
    // アクセシビリティ権限チェック（設定で無効にされている場合はスキップ）
    if (permissionConfig.disableKeyboardWhenDenied && hasAccessibilityPermission === false) {
      setTestResult('アクセシビリティ権限が必要です。権限を許可してください。');
      return;
    }
    
    try {
      setIsLoading(true);
      setTestResult(t('keyboard.testing'));
      const result = await invoke<string>("simulate_typing", { text });
      setTestResult(result);
      addLog(`${t('activity.keyboardTestPrefix')}: "${text}"`, 'success');
    } catch (error) {
      console.error("Failed to test typing:", error);
      setTestResult(`${t('messages.failed')}: ${error}`);
      addLog(`${t('activity.keyboardTestFailed')}: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add initial log with proper translation
    addLog(t('activity.startingServer'), 'info');
    
    // Initial server start
    startServer();
    
    // Check current password
    checkCurrentPassword();
    
    // Refresh status and password every 5 seconds
    const interval = setInterval(() => {
      refreshServerStatus();
      checkCurrentPassword();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader
        serverStatus={serverStatus}
        currentLanguage={i18n.language}
        onLanguageChange={(language) => i18n.changeLanguage(language)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Server Status */}
          <div className="lg:col-span-1">
            <ServerStatus status={serverStatus} />
          </div>

          {/* Connection Panel */}
          <div className="lg:col-span-2">
            <ConnectionPanel
              oneTimePassword={oneTimePassword}
              qrCodeImage={qrCodeImage}
              isGeneratingPassword={isGeneratingPassword}
              isGeneratingQR={isGeneratingQR}
              onGeneratePassword={generateOneTimePassword}
              onGenerateQR={generateQRCode}
            />
          </div>

          {/* System Permissions Banner */}
          <div className="lg:col-span-3">
            <PermissionBanner
              config={permissionConfig}
              hasAccessibilityPermission={hasAccessibilityPermission}
              isLoading={isPermissionLoading}
              onRequestPermissions={requestPermissions}
              onOpenSystemPreferences={openSystemPreferences}
            />
          </div>

          {/* Permission Status */}
          <div className="lg:col-span-1">
            <PermissionStatus
              config={permissionConfig}
              hasAccessibilityPermission={hasAccessibilityPermission}
              isLoading={isPermissionLoading}
              onCheckPermissions={checkPermissions}
              onRequestPermissions={requestPermissions}
              onOpenSystemPreferences={openSystemPreferences}
            />
          </div>

          {/* Keyboard Test */}
          <div className="lg:col-span-1">
            <KeyboardTest
              isLoading={isLoading}
              testResult={testResult}
              hasAccessibilityPermission={hasAccessibilityPermission}
              disableKeyboardWhenDenied={permissionConfig.disableKeyboardWhenDenied}
              onTest={testTyping}
            />
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-1">
            <ActivityLog logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;