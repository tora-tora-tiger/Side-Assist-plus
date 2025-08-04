import { useState, useCallback, useRef } from 'react';
import { NetworkService } from '../services/NetworkService';

export const useConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [macIP, setMacIP] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
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
      const foundIP = await NetworkService.scanForServer();

      if (foundIP) {
        setMacIP(foundIP);
        setIsConnected(true);
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

  return {
    isConnected,
    macIP,
    isSearching,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    scanForServer,
    sendText,
  };
};
