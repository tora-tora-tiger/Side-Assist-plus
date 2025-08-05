import { useState, useEffect, useCallback } from 'react';
import { serverService, ServerStatusType } from '../services/serverService';
import { passwordService } from '../services/passwordService';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const useServer = (onLog: (message: string, type: LogEntry['type']) => void) => {
  const [serverStatus, setServerStatus] = useState<ServerStatusType>({
    running: false,
    connected_clients: 0,
    port: 8080
  });
  const [isLoading, setIsLoading] = useState(false);
  const [oneTimePassword, setOneTimePassword] = useState<string | null>(null);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  const refreshServerStatus = useCallback(async () => {
    try {
      const status = await serverService.getStatus();
      setServerStatus(status);
    } catch (error) {
      console.error("Failed to get server status:", error);
      onLog('サーバーステータスの取得に失敗しました', 'error');
    }
  }, [onLog]);

  const startServer = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await serverService.start();
      onLog(result, 'success');
      await refreshServerStatus();
    } catch (error) {
      console.error("Failed to start server:", error);
      onLog(`サーバー開始に失敗しました: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onLog, refreshServerStatus]);

  const generateQRCode = useCallback(async () => {
    try {
      const qrCode = await passwordService.generateQR();
      setQrCodeImage(qrCode);
      onLog('QRコードを生成しました', 'success');
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      onLog(`QRコード生成に失敗しました: ${error}`, 'error');
      setQrCodeImage(null);
    }
  }, [onLog]);

  const generateOneTimePassword = useCallback(async () => {
    try {
      setIsGeneratingPassword(true);
      const password = await passwordService.generate();
      setOneTimePassword(password);
      onLog(`新しいワンタイムパスワードを生成しました: ${password}`, 'success');
      
      // パスワード生成後、自動的にQRコードも生成
      await generateQRCode();
    } catch (error) {
      console.error("Failed to generate password:", error);
      onLog(`パスワード生成に失敗しました: ${error}`, 'error');
    } finally {
      setIsGeneratingPassword(false);
    }
  }, [onLog, generateQRCode]);

  const checkCurrentPassword = useCallback(async () => {
    try {
      const password = await passwordService.getCurrent();
      setOneTimePassword(password);
    } catch (error) {
      console.error("Failed to get current password:", error);
    }
  }, []);

  const handlePortChange = useCallback(async (newPort: number) => {
    try {
      setIsLoading(true);
      onLog(`ポートを${newPort}に変更中...`, 'info');
      
      const result = await serverService.changePort(newPort);
      onLog(result, 'success');
      
      // サーバーステータスを更新
      setServerStatus(prev => ({ ...prev, port: newPort }));
      await refreshServerStatus();
    } catch (error) {
      console.error("Failed to change port:", error);
      onLog(`ポート変更に失敗しました: ${error}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onLog, refreshServerStatus]);

  // 初期化
  useEffect(() => {
    onLog('サーバーを開始中...', 'info');
    startServer();
    checkCurrentPassword();
    
    // 定期的にステータスとパスワードを更新
    const interval = setInterval(() => {
      refreshServerStatus();
      checkCurrentPassword();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [startServer, checkCurrentPassword, refreshServerStatus, onLog]);

  return {
    serverStatus,
    isLoading,
    oneTimePassword,
    isGeneratingPassword,
    qrCodeImage,
    refreshServerStatus,
    startServer,
    generateOneTimePassword,
    generateQRCode,
    handlePortChange
  };
};