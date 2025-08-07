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
import { CustomAlert } from '../components/CustomAlert';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const [showDebugToast, setShowDebugToast] = useState(false);
  const [alertData, setAlertData] = useState<any>(null);

  const {
    isConnected,
    macIP,
    isAuthenticated,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    sendText,
    sendCopy,
    sendPaste,
    executeCustomAction,
    prepareRecording,
    resetRecordingState,
    authenticateWithPassword,
    connectManually,
    disconnect,
  } = useConnection();

  useEffect(() => {
    console.log('🚀 [App] Connection status changed - isConnected:', isConnected);

    // 接続が確立されたら監視を開始
    if (isConnected) {
      console.log('📊 [App] Starting connection monitoring');
      startConnectionMonitoring();
    } else {
      console.log('📊 [App] Stopping connection monitoring');
      stopConnectionMonitoring();
    }

    return () => {
      console.log('🛑 [App] Cleanup - stopping monitoring');
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

  // カスタムアラートマネージャーの購読
  useEffect(() => {
    const unsubscribe = AlertManager.subscribe((alert) => {
      setAlertData(alert);
    });

    return unsubscribe;
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

      {(() => {
        console.log('🔍 [App] Rendering state - isConnected:', isConnected, 'isAuthenticated:', isAuthenticated);
        
        if (!isConnected) {
          console.log('📱 [App] Rendering HomeScreen (not connected)');
          return (
            <HomeScreen
              isConnected={isConnected}
              onSettingsPress={() => setShowSettings(true)}
              onConnect={connectManually}
              onDisconnect={disconnect}
            />
          );
        } else if (isAuthenticated) {
          console.log('🎯 [App] Rendering ExecutionScreen (connected & authenticated)');
          return (
            <ExecutionScreen
              onSettingsPress={() => setShowSettings(true)}
              onSendText={handleSendText}
              onSendCopy={sendCopy}
              onSendPaste={sendPaste}
              onExecuteCustomAction={executeCustomAction}
              onPrepareRecording={prepareRecording}
              resetRecordingState={resetRecordingState}
              onDisconnect={disconnect}
            />
          );
        } else {
          console.log('🔒 [App] Rendering HomeScreen + PasswordInput (connected but not authenticated)');
          return (
            <View className="flex-1">
              <HomeScreen
                isConnected={isConnected}
                onSettingsPress={() => setShowSettings(true)}
                onConnect={connectManually}
                onDisconnect={disconnect}
              />
              <PasswordInput
                onAuthenticate={authenticateWithPassword}
                isVisible={true}
              />
            </View>
          );
        }
      })()}

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

      <CustomAlert
        visible={!!alertData}
        title={alertData?.title || ''}
        message={alertData?.message || ''}
        buttons={alertData?.buttons}
        onDismiss={() => AlertManager.hideAlert()}
      />
    </View>
  );
};

export default App;