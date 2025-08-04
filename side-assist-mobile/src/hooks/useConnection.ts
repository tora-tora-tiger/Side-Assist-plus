import { useState, useCallback, useRef } from 'react';
import { NetworkService } from '../services/NetworkService';
import { NetworkPermissionService } from '../services/NetworkPermissionService';

export const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [macIP, setMacIP] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const connectionMonitorRef = useRef<NodeJS.Timeout | null>(null);

  const startConnectionMonitoring = useCallback(() => {
    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
    }

    const checkConnection = async () => {
      if (macIP) {
        const connected = await NetworkService.testConnection(macIP);
        setIsConnected(connected);

        if (!connected) {
          console.log('🔌 Connection lost, attempting to reconnect...');
          const foundIP = await NetworkService.scanForServer();
          if (foundIP && foundIP !== macIP) {
            setMacIP(foundIP);
            setIsConnected(true);
          }
        }
      }
    };

    connectionMonitorRef.current = setInterval(checkConnection, 5000);
    console.log('🔍 Connection monitoring started');
  }, [macIP]);

  const stopConnectionMonitoring = useCallback(() => {
    if (connectionMonitorRef.current) {
      clearInterval(connectionMonitorRef.current);
      connectionMonitorRef.current = null;
      console.log('🛑 Connection monitoring stopped');
    }
  }, []);

  const scanForServer = useCallback(async () => {
    setIsSearching(true);
    setMacIP('Scanning network...');

    try {
      // 権限チェックを先に実行
      const shouldShowGuide =
        await NetworkPermissionService.shouldShowPermissionGuide();
      if (shouldShowGuide) {
        setShowPermissionGuide(true);
        setMacIP('Network permission required');
        setIsConnected(false);
        setIsSearching(false);
        return;
      }

      const foundIP = await NetworkService.scanForServer();

      if (foundIP) {
        setMacIP(foundIP);
        setIsConnected(true);
        setShowPermissionGuide(false);
        console.log('✅ Found Mac server at:', foundIP);
      } else {
        setMacIP('No server found');
        setIsConnected(false);
        console.log('❌ No Mac server found on network');
      }
    } catch (error) {
      console.error('Network scan error:', error);
      setMacIP('Scan failed');
      setIsConnected(false);

      // エラーが権限関連の可能性をチェック
      const shouldShowGuide =
        await NetworkPermissionService.shouldShowPermissionGuide();
      setShowPermissionGuide(shouldShowGuide);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const sendText = useCallback(
    async (text: string): Promise<boolean> => {
      if (!macIP || !isConnected) {
        return false;
      }

      return await NetworkService.sendText(macIP, text);
    },
    [macIP, isConnected],
  );

  const dismissPermissionGuide = useCallback(() => {
    setShowPermissionGuide(false);
  }, []);

  return {
    isConnected,
    macIP,
    isSearching,
    showPermissionGuide,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    scanForServer,
    sendText,
    dismissPermissionGuide,
  };
};
