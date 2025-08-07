import { useState, useCallback, useRef, useEffect } from 'react';
import { NetworkService, CustomAction } from '../services/NetworkService';
import { DeepLinkService, ConnectionParams } from '../services/DeepLinkService';
import AlertManager from '../utils/AlertManager';

export const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [macIP, setMacIP] = useState<string>('');
  const [macPort, setMacPort] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [customActions, setCustomActions] = useState<CustomAction[]>([]);
  const connectionMonitorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const monitoringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingMonitorRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // DeepLink処理のハンドラー
  const handleDeepLink = useCallback(async (params: ConnectionParams) => {
    console.log('🔗 [useConnection] handleDeepLink START - params:', params);
    console.log(
      '🚨 [useConnection] This function should be called ONLY ONCE per QR scan!',
    );

    // まず接続をテスト
    console.log('🔗 [useConnection] Calling NetworkService.testConnection...');
    const connected = await NetworkService.testConnection(
      params.ip,
      params.port,
    );
    if (!connected) {
      console.log(
        '❌ [useConnection] Cannot reach server at:',
        `${params.ip}:${params.port}`,
      );
      return;
    }

    // 接続成功時にステートを更新
    console.log('🔗 [useConnection] Setting connection state...');
    setMacIP(params.ip);
    setMacPort(params.port);
    setIsConnected(true);

    console.log(
      '✅ [useConnection] Connected to server:',
      `${params.ip}:${params.port}`,
    );

    // パスワードで認証を試行
    console.log(
      '🔗 [useConnection] Calling NetworkService.authenticateWithPassword...',
    );
    const authSuccess = await NetworkService.authenticateWithPassword(
      params.ip,
      params.port,
      params.password,
    );
    if (authSuccess) {
      setIsAuthenticated(true);
      setPassword(params.password);
      console.log(
        '🎉 [useConnection] QR code connection and authentication successful!',
      );
    } else {
      console.log(
        '❌ [useConnection] Authentication failed with provided password',
      );
    }
    console.log('🔗 [useConnection] handleDeepLink END');
  }, []);

  // DeepLink処理のセットアップ
  useEffect(() => {
    const subscription = DeepLinkService.initialize();
    DeepLinkService.addListener(handleDeepLink);

    return () => {
      DeepLinkService.removeListener(handleDeepLink);
      DeepLinkService.cleanup();
      subscription?.remove();
    };
  }, [handleDeepLink]);

  // 認証成功時にカスタムアクションを読み込み
  useEffect(() => {
    if (isAuthenticated && macIP && macPort) {
      console.log('🔐 Authentication successful, loading custom actions...');
      loadCustomActions();
    } else {
      // 認証失敗時はカスタムアクションをクリア
      setCustomActions([]);
    }
  }, [isAuthenticated, macIP, macPort, loadCustomActions]);

  const startConnectionMonitoring = useCallback(() => {
    console.log(
      '🔍 [useConnection] startConnectionMonitoring called with IP:',
      macIP,
      'Port:',
      macPort,
    );

    // 既存のタイマーをクリア
    if (connectionMonitorRef.current) {
      console.log('🔍 [useConnection] Clearing existing monitor interval');
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
    }
    if (monitoringTimeoutRef.current) {
      console.log('🔍 [useConnection] Clearing existing monitor timeout');
      clearTimeout(monitoringTimeoutRef.current);
      monitoringTimeoutRef.current = null;
    }

    // 現在のIP/Portを保存（クロージャー対策）
    const currentIP = macIP;
    const currentPort = macPort;

    if (!currentIP || !currentPort) {
      console.log(
        '❌ [useConnection] Cannot start monitoring - missing IP or Port',
      );
      return;
    }

    // 初期接続直後は10秒待ってから監視開始（重複health checkを避ける）
    console.log(
      '🔍 [useConnection] Delaying monitoring start by 10 seconds to avoid duplicate health checks...',
    );

    monitoringTimeoutRef.current = setTimeout(() => {
      const checkConnection = async () => {
        console.log(
          '🔍 [useConnection] Periodic health check - calling testConnection...',
        );
        const connected = await NetworkService.testConnection(
          currentIP,
          currentPort,
        );
        setIsConnected(connected);

        if (!connected) {
          console.log('🔌 [useConnection] Connection lost');
          setIsConnected(false);
          setIsAuthenticated(false);
          setPassword('');
        }
      };

      connectionMonitorRef.current = setInterval(checkConnection, 10000); // 10秒間隔に延長
      console.log(
        '🔍 [useConnection] Connection monitoring started with 10s interval (after delay)',
      );
    }, 10000);
  }, [macIP, macPort]);

  const stopConnectionMonitoring = useCallback(() => {
    console.log('🛑 [useConnection] Stopping connection monitoring...');

    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
      console.log('🛑 [useConnection] Cleared monitoring interval');
    }

    if (monitoringTimeoutRef.current) {
      clearTimeout(monitoringTimeoutRef.current);
      monitoringTimeoutRef.current = null;
      console.log('🛑 [useConnection] Cleared monitoring timeout');
    }

    console.log('🛑 [useConnection] Connection monitoring stopped');
  }, []);

  const authenticateWithPassword = useCallback(
    async (inputPassword: string): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected) {
        return false;
      }

      const success = await NetworkService.authenticateWithPassword(
        macIP,
        macPort,
        inputPassword,
      );
      if (success) {
        setIsAuthenticated(true);
        setPassword(inputPassword);
        console.log('✅ Authentication successful');
      } else {
        setIsAuthenticated(false);
        setPassword('');
        console.log('❌ Authentication failed');
      }
      return success;
    },
    [macIP, macPort, isConnected],
  );

  const sendText = useCallback(
    async (text: string): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      return await NetworkService.sendText(macIP, macPort, text, password);
    },
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const sendCopy = useCallback(
    async (): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      return await NetworkService.sendAction(macIP, macPort, { type: 'copy' }, password);
    },
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const sendPaste = useCallback(
    async (): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      return await NetworkService.sendAction(macIP, macPort, { type: 'paste' }, password);
    },
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const executeCustomAction = useCallback(
    async (actionId: string): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      return await NetworkService.executeCustomAction(macIP, macPort, actionId, password);
    },
    [macIP, macPort, isConnected, isAuthenticated, password],
  );

  const prepareRecording = useCallback(
    async (actionId: string, name: string, icon?: string): Promise<boolean> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        return false;
      }

      const result = await NetworkService.prepareRecording(macIP, macPort, actionId, name, icon, password);
      
      if (result) {
        // 録画準備成功時に録画状態監視を開始
        startRecordingMonitoring();
      }
      
      return result;
    },
    [macIP, macPort, isConnected, isAuthenticated, password, startRecordingMonitoring],
  );

  const startRecordingMonitoring = useCallback(() => {
    if (recordingMonitorRef.current) {
      clearInterval(recordingMonitorRef.current);
    }

    console.log('🎥 Starting recording status monitoring...');

    recordingMonitorRef.current = setInterval(async () => {
      if (!macIP || !macPort) return;

      try {
        const status = await NetworkService.getRecordingStatus(macIP, macPort);
        console.log('🎥 Recording status check:', status);
        
        if (status?.status === 'completed') {
          console.log('🎉 Recording completed! Showing alert...', status);
          
          // アラート表示（完了確認付き）
          if (status.message) {
            console.log('📱 Calling AlertManager.showAlert with:', status.message);
            AlertManager.showAlert('録画完了', status.message, [{
              text: 'OK',
              onPress: async () => {
                console.log('✅ User acknowledged recording completion');
                // このresetRecordingStateは外部から提供される関数への参照として機能
                resetRecordingState();
              }
            }]);
          } else {
            console.log('📱 Calling AlertManager.showAlert with default message');
            AlertManager.showAlert('録画完了', '録画が完了しました', [{
              text: 'OK', 
              onPress: async () => {
                console.log('✅ User acknowledged recording completion');
                // このresetRecordingStateは外部から提供される関数への参照として機能
                resetRecordingState();
              }
            }]);
          }
          
          // 完了確認を送信
          console.log('✅ Sending acknowledgment...');
          await NetworkService.acknowledgeRecording(macIP, macPort);
          
          // カスタムアクションを再読み込み（新しく保存されたアクションを反映）
          console.log('🔄 Reloading custom actions after recording completion...');
          await loadCustomActions();
          
          // 監視停止
          stopRecordingMonitoring();
        } else if (status?.status === 'recording') {
          console.log('🔴 Still recording... keys:', status.recorded_keys_count || 0);
        } else if (status?.status === 'preparing') {
          console.log('🟡 Recording prepared, waiting for start...');
        } else {
          console.log('⚪ Recording status:', status?.status || 'unknown');
        }
      } catch (error) {
        console.error('Recording status monitoring error:', error);
      }
    }, 1000); // 1秒ごとにチェック
  }, [macIP, macPort]);

  const stopRecordingMonitoring = useCallback(() => {
    if (recordingMonitorRef.current) {
      clearInterval(recordingMonitorRef.current);
      recordingMonitorRef.current = null;
      console.log('🎥 Recording status monitoring stopped');
    }
  }, []);

  const loadCustomActions = useCallback(
    async (): Promise<void> => {
      if (!macIP || !macPort || !isConnected || !isAuthenticated) {
        console.log('⚠️ Cannot load custom actions - missing connection info:', {
          macIP: !!macIP,
          macPort: !!macPort, 
          isConnected,
          isAuthenticated
        });
        return;
      }

      try {
        console.log(`📋 Loading custom actions from ${macIP}:${macPort}...`);
        const actions = await NetworkService.getCustomActions(macIP, macPort);
        console.log(`📦 Received ${actions.length} custom actions:`, actions.map(a => ({ id: a.id, name: a.name, keys: a.key_sequence.length })));
        setCustomActions(actions);
        console.log(`✅ Successfully updated local state with ${actions.length} custom actions`);
      } catch (error) {
        console.error('❌ Failed to load custom actions:', error);
        setCustomActions([]);
      }
    },
    [macIP, macPort, isConnected, isAuthenticated]
  );

  const resetRecordingState = useCallback(() => {
    console.log('🔄 Resetting recording UI state for next recording');
    // ExecutionScreenのグローバル関数を呼び出してリセット
    if (typeof (window as any).resetExecutionScreenRecordingState === 'function') {
      console.log('🎯 Calling ExecutionScreen reset function...');
      (window as any).resetExecutionScreenRecordingState();
    } else {
      console.log('⚠️ ExecutionScreen reset function not found');
    }
  }, []);

  const connectManually = useCallback(
    async (ip: string, port: string, password: string): Promise<boolean> => {
      try {
        console.log(
          '🔗 [useConnection] connectManually START - ip:',
          ip,
          'port:',
          port,
        );
        console.log(
          '🚨 [useConnection] This function should be called ONLY ONCE per connection attempt!',
        );

        // まず接続をテスト
        console.log(
          '🔗 [useConnection] Calling NetworkService.testConnection from connectManually...',
        );
        const connected = await NetworkService.testConnection(ip, port);
        if (!connected) {
          console.log(
            '❌ [useConnection] Cannot reach server at:',
            `${ip}:${port}`,
          );
          return false;
        }

        // 接続成功時にステートを更新
        console.log(
          '🔗 [useConnection] Setting connection state in connectManually...',
        );
        setMacIP(ip);
        setMacPort(port);
        setIsConnected(true);

        console.log('✅ [useConnection] Connected to server:', `${ip}:${port}`);

        // パスワードで認証を試行
        console.log(
          '🔗 [useConnection] Calling NetworkService.authenticateWithPassword from connectManually...',
        );
        const authSuccess = await NetworkService.authenticateWithPassword(
          ip,
          port,
          password,
        );
        if (authSuccess) {
          setIsAuthenticated(true);
          setPassword(password);
          console.log(
            '🎉 [useConnection] Manual connection and authentication successful!',
          );
          console.log('🔗 [useConnection] connectManually END - SUCCESS');
          return true;
        } else {
          console.log(
            '❌ [useConnection] Authentication failed with provided password',
          );
          console.log('🔗 [useConnection] connectManually END - AUTH FAILED');
          return false;
        }
      } catch (error) {
        console.error('[useConnection] Manual connection error:', error);
        console.log('🔗 [useConnection] connectManually END - ERROR');
        return false;
      }
    },
    [],
  );

  const disconnect = useCallback(() => {
    console.log('🔌 [useConnection] disconnect START');
    
    // 全ての監視を停止
    stopConnectionMonitoring();
    stopRecordingMonitoring();
    
    // 接続状態をリセット
    setIsConnected(false);
    setIsAuthenticated(false);
    setMacIP('');
    setMacPort('');
    setPassword('');
    
    console.log('🔌 [useConnection] Connection disconnected and state reset');
    console.log('🔌 [useConnection] disconnect END');
  }, [stopConnectionMonitoring, stopRecordingMonitoring]);

  return {
    isConnected,
    macIP,
    macPort,
    isAuthenticated,
    password,
    customActions,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    sendText,
    sendCopy,
    sendPaste,
    executeCustomAction,
    prepareRecording,
    resetRecordingState,
    loadCustomActions,
    authenticateWithPassword,
    connectManually,
    disconnect,
  };
};