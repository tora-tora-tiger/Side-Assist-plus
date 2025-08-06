import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import '../global.css';
import AlertManager from './utils/AlertManager';

import { useConnection } from './hooks/useConnection';
import { StatusIndicator } from './components/StatusIndicator';
import { StatusMessage } from './components/StatusMessage';
import { MainButton } from './components/MainButton';
import { SettingsPanel } from './components/SettingsPanel';
import { PasswordInput } from './components/PasswordInput';
import { ConnectionSetup } from './components/ConnectionSetup';
import { NetworkPermissionGuide } from './components/NetworkPermissionGuide';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));
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
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="bg-white pt-15 pb-5 px-5 shadow-sm">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-3xl mr-3">🤝</Text>
            <Text className="text-xl font-bold text-gray-900">Side Assist</Text>
          </View>

          <TouchableOpacity
            className="w-11 h-11 bg-gray-50 rounded-full justify-center items-center shadow"
            onPress={() => setShowSettings(!showSettings)}
          >
            <Text className="text-xl text-gray-600">⚙️</Text>
          </TouchableOpacity>
        </View>

        <StatusIndicator isConnected={isConnected} />
      </View>

      <View className="flex-1 pt-5">
        <StatusMessage isConnected={isConnected} />

        <ConnectionSetup onConnect={connectManually} isVisible={!isConnected} />

        <PasswordInput
          onAuthenticate={authenticateWithPassword}
          isVisible={isConnected && !isAuthenticated}
        />

        <MainButton
          isConnected={isConnected && isAuthenticated}
          buttonScale={buttonScale}
          onPress={handleSendText}
        />
      </View>

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
