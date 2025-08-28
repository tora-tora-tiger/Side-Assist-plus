import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AlertManager from "../utils/AlertManager";
import DebugToastManager from "../utils/DebugToastManager";

import { useConnection } from "../hooks/useConnection";
import { HomeScreen } from "../components/HomeScreen";
import { ExecutionScreen } from "../components/ExecutionScreen";
import { SettingsPanel } from "../components/SettingsPanel";
import { PasswordInput } from "../components/PasswordInput";
import { DebugToast } from "../components/DebugToast";
import { CustomAlert } from "../components/CustomAlert";
import { SettingsProvider } from "../contexts/SettingsContext";

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [debugMessage, setDebugMessage] = useState("");
  const [showDebugToast, setShowDebugToast] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    message: string;
    buttons: Array<{ text: string; onPress?: () => void }>;
  } | null>(null);

  const {
    isConnected,
    macIP,
    isAuthenticated,
    customActions,
    isAutoReconnecting,
    isInitialized,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    sendText,
    sendCopy,
    sendPaste,
    sendGesture,
    executeCustomAction,
    prepareRecording,
    resetRecordingState,
    authenticateWithPassword,
    connectManually,
    disconnect,
    clearStoredConnection,
  } = useConnection();

  useEffect(() => {
    // 接続が確立されたら監視を開始
    if (isConnected) {
      startConnectionMonitoring();
    } else {
      stopConnectionMonitoring();
    }

    return () => {
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
    const unsubscribe = AlertManager.subscribe(alert => {
      setAlertData(alert);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSendText = async (text: string) => {
    if (!isAuthenticated) {
      AlertManager.showAlert("認証が必要", "まずパスワードで認証してください");
      return;
    }

    try {
      const success = await sendText(text);
      if (!success) {
        AlertManager.showAlert(
          "送信失敗",
          "テキストの送信に失敗しました。パスワードを再確認してください。",
        );
      }
    } catch (error) {
      console.error("Send text error:", error);
      AlertManager.showAlert(
        "エラー",
        "テキストの送信中にエラーが発生しました",
      );
    }
  };

  return (
    <SettingsProvider ip={macIP} port="8080">
      <View className="flex-1 bg-white">
        {(() => {
          // 初期化中またはローディング中の場合
          if (!isInitialized || isAutoReconnecting) {
            return (
              <View className="flex-1 bg-neutral-50 justify-center items-center">
                <View className="bg-white rounded-3xl p-8 shadow-soft w-80 max-w-xs mx-4">
                  <View className="items-center">
                    <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mb-6">
                      <MaterialIcons
                        name="autorenew"
                        size={32}
                        color="#0ea5e9"
                      />
                    </View>
                    <Text className="text-xl font-bold text-neutral-900 mb-2">
                      {isAutoReconnecting ? "自動接続中..." : "初期化中..."}
                    </Text>
                    <Text className="text-neutral-600 text-center mb-4">
                      {isAutoReconnecting
                        ? "保存された接続情報で自動接続しています"
                        : "アプリを準備しています"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }

          if (!isConnected) {
            return (
              <HomeScreen
                isConnected={isConnected}
                onSettingsPress={() => setShowSettings(true)}
                onConnect={connectManually}
                onDisconnect={disconnect}
                onClearStoredConnection={clearStoredConnection}
              />
            );
          } else if (isAuthenticated) {
            return (
              <ExecutionScreen
                onSettingsPress={() => setShowSettings(true)}
                onSendText={handleSendText}
                onSendCopy={sendCopy}
                onSendPaste={sendPaste}
                onSendGesture={sendGesture}
                onExecuteCustomAction={executeCustomAction}
                onPrepareRecording={prepareRecording}
                resetRecordingState={resetRecordingState}
                customActions={customActions}
                onDisconnect={disconnect}
              />
            );
          } else {
            return (
              <View className="flex-1">
                <HomeScreen
                  isConnected={isConnected}
                  onSettingsPress={() => setShowSettings(true)}
                  onConnect={connectManually}
                  onDisconnect={disconnect}
                  onClearStoredConnection={clearStoredConnection}
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
          title={alertData?.title || ""}
          message={alertData?.message || ""}
          buttons={alertData?.buttons}
          onDismiss={() => AlertManager.hideAlert()}
        />
      </View>
    </SettingsProvider>
  );
};

export default App;
