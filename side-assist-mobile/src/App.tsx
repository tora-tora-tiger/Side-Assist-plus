import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import '../global.css';
import AlertManager from './utils/AlertManager';

import { useConnection } from './hooks/useConnection';
import { HomeScreen } from './components/HomeScreen';
import { ExecutionScreen } from './components/ExecutionScreen';
import { SettingsPanel } from './components/SettingsPanel';
import { PasswordInput } from './components/PasswordInput';
import { NetworkPermissionGuide } from './components/NetworkPermissionGuide';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);

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
      ) : !isAuthenticated ? (
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
      ) : (
        // 接続済み・認証済み: ExecutionScreen表示
        <ExecutionScreen
          onSettingsPress={() => setShowSettings(true)}
          onSendText={handleSendText}
        />
      )}

      <SettingsPanel
        isVisible={showSettings}
        isConnected={isConnected}
        macIP={macIP}
        onClose={() => setShowSettings(false)}
        onShowPermissionGuide={() => setShowPermissionGuide(true)}
      />

      <NetworkPermissionGuide
        isVisible={showPermissionGuide}
        onDismiss={() => setShowPermissionGuide(false)}
      />
    </View>
  );
};

export default App;
