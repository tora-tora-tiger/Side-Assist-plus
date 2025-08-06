import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import AlertManager from '../utils/AlertManager';
import DebugToastManager from '../utils/DebugToastManager';

import { useConnection } from '../hooks/useConnection';
import { HomeScreen } from '../components/HomeScreen';
import { ExecutionScreen } from '../components/ExecutionScreen';
import { SettingsPanel } from '../components/SettingsPanel';
import { PasswordInput } from '../components/PasswordInput';
import { DebugToast } from '../components/DebugToast';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const [showDebugToast, setShowDebugToast] = useState(false);

  const {
    isConnected,
    macIP,
    isAuthenticated,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    sendText,
    authenticateWithPassword,
    connectManually,
  } = useConnection();

  useEffect(() => {
    console.log('🚀 [App] useEffect triggered - isConnected:', isConnected);

    // 接続が確立されたら監視を開始
    if (isConnected) {
      console.log(
        '📊 [App] Starting connection monitoring because isConnected=true',
      );
      startConnectionMonitoring();
    } else {
      console.log(
        '📊 [App] Stopping connection monitoring because isConnected=false',
      );
      stopConnectionMonitoring();
    }

    return () => {
      console.log('🛑 [App] useEffect cleanup - stopping monitoring');
      stopConnectionMonitoring();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // デバッグトーストマネージャーの購読
  useEffect(() => {
    const unsubscribe = DebugToastManager.subscribe((message: string) => {
      setDebugMessage(message);
      setShowDebugToast(true);
    });

    return unsubscribe;
  }, []);

  // AlertManager状態の定期監視（デバッグ用）
  useEffect(() => {
    const interval = setInterval(() => {
      const status = AlertManager.getQueueStatus();
      if (status.isVisible || status.queueLength > 0) {
        console.log('🚨 [App] AlertManager Status Check:', status);
        if (status.isVisible) {
          DebugToastManager.show(`Alert Active: ${status.currentAlert?.substring(0, 30)}...`);
        }
      }
    }, 5000); // 5秒間隔でチェック

    return () => clearInterval(interval);
  }, []);

  const handleSendText = async (text: string) => {
    if (!isAuthenticated) {
      AlertManager.showAlert('認証が必要', 'まずパスワードで認証してください');
      return;
    }

    try {
      const success = await sendText(text);
      if (success) {
        console.log(`✅ Text sent successfully: "${text}"`);
      } else {
        AlertManager.showAlert(
          '送信失敗',
          'テキストの送信に失敗しました。パスワードを再確認してください。',
        );
      }
    } catch (error) {
      console.error('Send text error:', error);
      AlertManager.showAlert(
        'エラー',
        'テキストの送信中にエラーが発生しました',
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {!isConnected ? (
        // 接続前: HomeScreen表示
        <HomeScreen
          isConnected={isConnected}
          onSettingsPress={() => setShowSettings(true)}
          onConnect={connectManually}
        />
      ) : isAuthenticated ? (
        // 接続済み・認証済み: ExecutionScreen表示
        <ExecutionScreen
          onSettingsPress={() => {
            DebugToastManager.showTouchEvent('Settings Button (ExecutionScreen)', 'Press');
            setShowSettings(true);
          }}
          onSendText={handleSendText}
        />
      ) : (
        // 接続済み・認証前: パスワード入力表示
        <View className="flex-1">
          <HomeScreen
            isConnected={isConnected}
            onSettingsPress={() => setShowSettings(true)}
            onConnect={connectManually}
          />
          <PasswordInput
            onAuthenticate={authenticateWithPassword}
            isVisible={true}
          />
        </View>
      )}

      <SettingsPanel
        isVisible={showSettings}
        isConnected={isConnected}
        macIP={macIP}
        onClose={() => setShowSettings(false)}
      />

      
      <DebugToast
        message={debugMessage}
        visible={showDebugToast}
        onHide={() => setShowDebugToast(false)}
        duration={3000}
      />
    </View>
  );
};

export default App;