import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface ServerStatus {
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
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    running: false,
    connected_clients: 0,
    port: 8080
  });
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: new Date().toLocaleTimeString(), message: "Starting Side Assist Desktop Server", type: 'info' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      time: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-9), newLog]); // Keep last 10 logs
  };

  const refreshServerStatus = async () => {
    try {
      const status = await invoke<ServerStatus>("get_server_status");
      setServerStatus(status);
    } catch (error) {
      console.error("Failed to get server status:", error);
      addLog("Failed to get server status", 'error');
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
      addLog(`Failed to start server: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testTyping = async () => {
    if (!testText.trim()) return;
    
    try {
      setIsLoading(true);
      setTestResult("Testing...");
      const result = await invoke<string>("simulate_typing", { text: testText });
      setTestResult(result);
      addLog(`Keyboard test: "${testText}"`, 'success');
    } catch (error) {
      console.error("Failed to test typing:", error);
      setTestResult(`Failed: ${error}`);
      addLog(`Keyboard test failed: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial server start
    startServer();
    
    // Refresh status every 5 seconds
    const interval = setInterval(refreshServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!serverStatus.running) return "bg-red-500";
    return serverStatus.connected_clients > 0 ? "bg-green-500" : "bg-yellow-500";
  };

  const getStatusText = () => {
    if (!serverStatus.running) return "Offline";
    return serverStatus.connected_clients > 0 ? "Connected" : "Waiting";
  };

  const getLogTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🤝</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Side Assist Desktop
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cross-platform keyboard automation server
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Server Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Server Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Port:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {serverStatus.port}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <span className={`font-medium ${serverStatus.running ? 'text-green-600' : 'text-red-600'}`}>
                  {serverStatus.running ? 'Running' : 'Stopped'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Connected Clients:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {serverStatus.connected_clients}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Connection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mobile Connection
            </h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Mobile devices can connect to:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-3 font-mono text-sm">
                http://localhost:{serverStatus.port}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Make sure your mobile device is on the same Wi-Fi network.
              </p>
            </div>
          </div>

          {/* Keyboard Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Keyboard Simulation
            </h2>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to simulate typing..."
                  maxLength={100}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  onKeyDown={(e) => e.key === 'Enter' && testTyping()}
                />
                <button
                  onClick={testTyping}
                  disabled={!testText.trim() || isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Testing..." : "Test"}
                </button>
              </div>
              {testResult && (
                <div className={`text-sm ${testResult.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {testResult}
                </div>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Activity Log
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="flex space-x-3 text-sm">
                  <span className="text-gray-400 dark:text-gray-500 font-mono">
                    {log.time}
                  </span>
                  <span className={getLogTypeColor(log.type)}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;