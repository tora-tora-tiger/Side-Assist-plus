import { useState } from "react";
import { permissionConfig } from './config/permissions';
import { usePermissions } from './hooks/usePermissions';
import { useServer } from './hooks/useServer';
import { useKeyboardTest } from './hooks/useKeyboardTest';
import { ServerStatus } from './components/ServerStatus';
import { ConnectionPanel } from './components/ConnectionPanel';
import { KeyboardTest } from './components/KeyboardTest';
import { ActivityLog } from './components/ActivityLog';
import { PermissionStatus } from './components/PermissionStatus';
import { PortSettings } from './components/PortSettings';
import { RecordingModal } from './components/RecordingModal';
import { Icon } from './components/ui';
import "./App.css";

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  count: number;
  id: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('connection');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const logId = `${message}-${type}`; // メッセージとタイプでIDを生成
    const currentTime = new Date().toLocaleTimeString();
    
    setLogs(prev => {
      // 同じメッセージとタイプのログが既に存在するかチェック
      const existingLogIndex = prev.findIndex(log => log.id === logId);
      
      if (existingLogIndex !== -1) {
        // 既存のログが見つかった場合、カウントを増やして時刻を更新
        const updatedLogs = [...prev];
        updatedLogs[existingLogIndex] = {
          ...updatedLogs[existingLogIndex],
          count: updatedLogs[existingLogIndex].count + 1,
          time: currentTime
        };
        return updatedLogs;
      } else {
        // 新しいログの場合、追加
        const newLog: LogEntry = {
          time: currentTime,
          message,
          type,
          count: 1,
          id: logId
        };
        // 最新の5つのログを保持
        return [...prev.slice(-4), newLog];
      }
    });
  };

  // 権限管理フック
  const {
    hasAccessibilityPermission,
    isLoading: isPermissionLoading,
    openSystemPreferences,
  } = usePermissions(permissionConfig, addLog);

  // サーバー管理フック
  const {
    serverStatus,
    isLoading: isServerLoading,
    oneTimePassword,
    isGeneratingPassword,
    qrCodeImage,
    passwordExpired,
    generateOneTimePassword,
    handlePortChange
  } = useServer(addLog);

  // キーボードテストフック
  const {
    testResult,
    isLoading: isKeyboardLoading,
    testTyping
  } = useKeyboardTest(hasAccessibilityPermission, addLog);

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
                  passwordExpired={passwordExpired}
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'keyboard' && (
          <div className="h-full p-2 flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-2xl">
              <KeyboardTest
                isLoading={isKeyboardLoading}
                testResult={testResult}
                hasAccessibilityPermission={hasAccessibilityPermission}
                disableKeyboardWhenDenied={permissionConfig.disableKeyboardWhenDenied}
                onTest={testTyping}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'permissions' && (
          <div className="h-full p-2 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-2 max-w-5xl mx-auto">
              <div className="overflow-hidden">
                <PortSettings
                  currentPort={serverStatus.port}
                  onPortChange={handlePortChange}
                  isLoading={isServerLoading}
                />
              </div>
              <div className="overflow-hidden">
                <PermissionStatus
                  config={permissionConfig}
                  hasAccessibilityPermission={hasAccessibilityPermission}
                  isLoading={isPermissionLoading}
                  onOpenSystemPreferences={openSystemPreferences}
                />
              </div>
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
      
      {/* Recording Modal */}
      <RecordingModal />
    </div>
  );
}

export default App;