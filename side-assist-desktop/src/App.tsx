import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from 'react-i18next';
import { permissionConfig } from './config/permissions';
import { usePermissions } from './hooks/usePermissions';
import { ServerStatus } from './components/ServerStatus';
import { ConnectionPanel } from './components/ConnectionPanel';
import { KeyboardTest } from './components/KeyboardTest';
import { ActivityLog } from './components/ActivityLog';
import { PermissionStatus } from './components/PermissionStatus';
import { Icon } from './components/ui';
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('connection');
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

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      time: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-4), newLog]); // Keep last 5 logs
  };

  // 権限管理フック
  const {
    hasAccessibilityPermission,
    isLoading: isPermissionLoading,
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
      const qrCode = await invoke<string>("generate_qr_code");
      setQrCodeImage(qrCode);
      addLog('QRコードを生成しました', 'success');
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      addLog(`QRコード生成に失敗しました: ${error}`, 'error');
      setQrCodeImage(null);
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

  const tabs = [
    {
      id: 'connection',
      label: 'Connection',
      icon: 'mobile',
      badge: serverStatus.connected_clients
    },
    {
      id: 'keyboard', 
      label: 'Test',
      icon: 'keyboard'
    },
    {
      id: 'permissions',
      label: 'System',
      icon: 'settings'
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: 'activity'
    }
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-800/30 bg-black/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-stone-500 to-stone-600 rounded-md flex items-center justify-center">
              <Icon name="connect" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-stone-200">Side Assist</h1>
              <p className="text-xs text-stone-400">Port {serverStatus.port}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus.running ? 
                serverStatus.connected_clients > 0 ? 'bg-stone-400' : 'bg-stone-500' 
                : 'bg-stone-600'
            }`} />
            <div className="text-right">
              <div className="text-sm text-stone-200 font-medium">
                {serverStatus.running ? 
                  serverStatus.connected_clients > 0 ? 'Connected' : 'Ready' 
                  : 'Offline'}
              </div>
              {serverStatus.connected_clients > 0 && (
                <div className="text-xs text-stone-400">
                  {serverStatus.connected_clients} device{serverStatus.connected_clients > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800/20 bg-black/40 backdrop-blur-sm shrink-0">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-all relative ${
                activeTab === tab.id
                  ? 'border-stone-400 text-stone-300 bg-stone-400/10'
                  : 'border-transparent text-stone-500 hover:text-stone-400 hover:bg-gray-800/30'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-stone-600 text-stone-200 text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-medium">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'connection' && (
          <div className="h-full p-2 overflow-hidden">
            <div className="h-full grid grid-cols-3 gap-2">
              <div className="col-span-1 overflow-hidden">
                <ServerStatus 
                  status={serverStatus}
                  isGeneratingPassword={isGeneratingPassword}
                  onGeneratePassword={generateOneTimePassword}
                />
              </div>
              <div className="col-span-2 overflow-hidden">
                <ConnectionPanel
                  oneTimePassword={oneTimePassword}
                  qrCodeImage={qrCodeImage}
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'keyboard' && (
          <div className="h-full p-2 flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-2xl">
              <KeyboardTest
                isLoading={isLoading}
                testResult={testResult}
                hasAccessibilityPermission={hasAccessibilityPermission}
                disableKeyboardWhenDenied={permissionConfig.disableKeyboardWhenDenied}
                onTest={testTyping}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'permissions' && (
          <div className="h-full p-2 flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-3xl">
              <PermissionStatus
                config={permissionConfig}
                hasAccessibilityPermission={hasAccessibilityPermission}
                isLoading={isPermissionLoading}
                onOpenSystemPreferences={openSystemPreferences}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'logs' && (
          <div className="h-full p-2 overflow-hidden">
            <div className="h-full max-w-4xl mx-auto">
              <ActivityLog logs={logs} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;