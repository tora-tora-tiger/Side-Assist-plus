import { useState, useEffect, useCallback, useRef } from 'react';
import { serverService, ServerStatusType } from '../services/serverService';
import { passwordService } from '../services/passwordService';

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  count: number;
  id: string;
}

// パスワード期限設定 (デバッグ用: 10秒 | 本番用: 5分)
const PASSWORD_EXPIRY_TIME = 10 * 1000; // 10秒でテスト
// const PASSWORD_EXPIRY_TIME = 5 * 60 * 1000; // 5分

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
  const [passwordExpired, setPasswordExpired] = useState(false);
  const passwordTimerRef = useRef<number | null>(null);

  const refreshServerStatus = useCallback(async () => {
    try {
      const status = await serverService.getStatus();
      setServerStatus(status);
    } catch (error) {
      console.error("Failed to get server status:", error);
      onLog('サーバーステータスの取得に失敗しました', 'error');
    }
  }, [onLog]);

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

  const clearPasswordTimer = useCallback(() => {
    if (passwordTimerRef.current) {
      clearTimeout(passwordTimerRef.current);
      passwordTimerRef.current = null;
    }
  }, []);

  const startPasswordTimer = useCallback(() => {
    clearPasswordTimer();
    passwordTimerRef.current = window.setTimeout(() => {
      setPasswordExpired(true);
      // QRコードは残してblur効果を適用するため、nullにしない
      // setQrCodeImage(null);
      // setOneTimePassword(null);
      onLog('パスワードが期限切れになりました', 'warning');
    }, PASSWORD_EXPIRY_TIME);
  }, [clearPasswordTimer, onLog]);

  const generateOneTimePassword = useCallback(async () => {
    try {
      setIsGeneratingPassword(true);
      const password = await passwordService.generate();
      setOneTimePassword(password);
      setPasswordExpired(false);
      onLog(`新しいワンタイムパスワードを生成しました: ${password}`, 'success');
      
      // パスワード生成後、自動的にQRコードも生成
      await generateQRCode();
      
      // タイマー開始
      startPasswordTimer();
    } catch (error) {
      console.error("Failed to generate password:", error);
      onLog(`パスワード生成に失敗しました: ${error}`, 'error');
    } finally {
      setIsGeneratingPassword(false);
    }
  }, [onLog, generateQRCode, startPasswordTimer]);

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

  const checkCurrentPassword = useCallback(async () => {
    try {
      const password = await passwordService.getCurrent();
      
      // サーバーからパスワードがnullで返された場合の処理
      if (!password && oneTimePassword && !passwordExpired) {
        setPasswordExpired(true);
        // QRコードは残してblur効果を適用するため、nullにしない
        // setQrCodeImage(null);
        // setOneTimePassword(null);
        clearPasswordTimer();
        onLog('サーバーからパスワードが期限切れと報告されました', 'warning');
      } else if (password && !oneTimePassword) {
        // 新しいパスワードが生成された場合（外部から）
        setOneTimePassword(password);
        setPasswordExpired(false);
        await generateQRCode();
        startPasswordTimer();
      }
    } catch (error) {
      console.error("Failed to get current password:", error);
    }
  }, [oneTimePassword, passwordExpired, onLog, generateQRCode, clearPasswordTimer, startPasswordTimer]);

  const handlePortChange = useCallback(async (newPort: number) => {
    // 既に処理中の場合は拒否
    if (isLoading) {
      onLog('サーバー操作が実行中です。しばらくお待ちください。', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      onLog(`ポートを${newPort}に変更中...`, 'info');
      
      const result = await serverService.changePort(newPort);
      onLog(result, 'success');
      
      // サーバーステータスを更新
      setServerStatus(prev => ({ ...prev, port: newPort }));
      
      // 少し待機してからステータスを確認
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshServerStatus();
    } catch (error) {
      console.error("Failed to change port:", error);
      onLog(`ポート変更に失敗しました: ${error}`, 'error');
      
      // エラー時はステータスを再取得して正しい状態に戻す
      await refreshServerStatus();
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onLog, refreshServerStatus]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      clearPasswordTimer();
    };
  }, [clearPasswordTimer]);

  // 初期化
  useEffect(() => {
    const initializeServer = async () => {
      try {
        onLog('サーバー状態を確認中...', 'info');
        
        // まずサーバーの状態を確認
        await refreshServerStatus();
        
        // サーバーが実行中でない場合のみ起動
        const currentStatus = await serverService.getStatus();
        if (!currentStatus.running) {
          onLog('サーバーを開始中...', 'info');
          await startServer();
        } else {
          onLog('サーバーは既に実行中です', 'success');
        }
        
        // パスワードをチェック
        await checkCurrentPassword();
      } catch (error) {
        console.error("Server initialization failed:", error);
        onLog(`サーバー初期化に失敗しました: ${error}`, 'error');
      }
    };
    
    initializeServer();
    
    // 定期的にステータスとパスワードを更新
    const interval = setInterval(() => {
      refreshServerStatus();
      checkCurrentPassword();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearPasswordTimer();
    };
    // 依存関係を削除して初期化を1回だけ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    serverStatus,
    isLoading,
    oneTimePassword,
    isGeneratingPassword,
    qrCodeImage,
    passwordExpired,
    refreshServerStatus,
    startServer,
    generateOneTimePassword,
    generateQRCode,
    handlePortChange
  };
};