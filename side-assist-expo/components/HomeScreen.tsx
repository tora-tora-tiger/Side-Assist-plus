import React, { useState } from 'react';
import { View, Text, Linking } from 'react-native';
import { Header, Button, StatusIndicator } from './ui';
import { QRScanner } from './QRScanner';
import { ConnectionSetup } from './ConnectionSetup';
import { DeepLinkService } from '../services/DeepLinkService';
import { MaterialIcons } from '@expo/vector-icons';
import AlertManager from '../utils/AlertManager';

interface HomeScreenProps {
  isConnected: boolean;
  onSettingsPress: () => void;
  onConnect: (ip: string, port: string, password: string) => Promise<boolean>;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isConnected,
  onSettingsPress,
  onConnect,
}) => {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const handleOpenQRScanner = () => {
    console.log('📷 [HomeScreen] Opening QR scanner');
    setShowQRScanner(true);
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
  };

  const handleQRCodeScanned = async (data: string) => {
    console.log('📱 [HomeScreen] QR Code scanned:', data);
    
    // QRコードからURL解析
    const connectionParams = DeepLinkService.parseConnectionURL(data);
    console.log('📱 Parsed connection params:', connectionParams);

    // まずQRスキャナーを閉じる
    setShowQRScanner(false);

    // Modalのアンマウント完了を待つ
    setTimeout(async () => {
      if (!connectionParams) {
        AlertManager.showAlert(
          'QRコードエラー',
          `無効なQRコードです。\n\n読み取ったデータ:\n${data.substring(0, 100)}${
            data.length > 100 ? '...' : ''
          }\n\nPCで生成された正しいQRコードをスキャンしてください。`,
          [
            {
              text: '再試行',
              onPress: () => {
                setTimeout(() => {
                  setShowQRScanner(true);
                }, 300);
              },
            },
            {
              text: 'キャンセル',
            },
          ],
        );
        return;
      }

      // 自動接続を試行
      try {
        const success = await onConnect(
          connectionParams.ip,
          connectionParams.port,
          connectionParams.password,
        );

        if (success) {
          AlertManager.showAlert('接続成功', 'PCに正常に接続されました！');
        } else {
          AlertManager.showAlert(
            '接続失敗',
            'PCに接続できませんでした。PCが起動していることとネットワーク接続を確認してください。',
          );
        }
      } catch (error) {
        console.error('QR connection error:', error);
        AlertManager.showAlert('エラー', '接続中にエラーが発生しました');
      }
    }, 300);
  };

  const handleOpenManualInput = () => {
    setShowManualInput(true);
  };

  const handleCloseManualInput = () => {
    setShowManualInput(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* ヘッダー */}
      <Header
        title="Side Assist Plus"
        showSettings={true}
        onSettingsPress={onSettingsPress}
        showShadow={true}
      />

      {/* ステータス表示 */}
      <View className="px-5 pb-5">
        <StatusIndicator isConnected={isConnected} />
      </View>

      {/* メインコンテンツ */}
      <View className="flex-1 px-6">
        {!isConnected ? (
          <>
            {/* 接続前の画面 */}
            <View className="flex-1 justify-between py-4">
              {/* 上部のメインコンテンツ */}
              <View className="flex-1 justify-center">
                <View className="items-center mb-10">
                  <View className="mb-6 p-6 bg-blue-50 rounded-full shadow-lg">
                    <MaterialIcons name="smartphone" size={64} color="#3b82f6" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
                    PCと接続
                  </Text>
                  <Text className="text-base text-gray-600 text-center leading-relaxed px-4">
                    QRコードをスキャンして{'\n'}簡単に接続できます
                  </Text>
                </View>

                <View className="space-y-5">
                  {/* QRスキャンボタン */}
                  <Button
                    title="Scan the QR Code"
                    icon={
                      <MaterialIcons name="qr-code" size={20} color="#ffffff" />
                    }
                    variant="primary"
                    size="large"
                    onPress={handleOpenQRScanner}
                  />

                  {/* 区切り線 */}
                  <View className="flex-row items-center py-3">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-6 text-sm text-gray-500 font-medium">
                      or
                    </Text>
                    <View className="flex-1 h-px bg-gray-300" />
                  </View>

                  {/* 手動入力ボタン */}
                  <Button
                    title="Input Manually"
                    icon={
                      <MaterialIcons name="keyboard" size={20} color="#374151" />
                    }
                    variant="secondary"
                    size="large"
                    onPress={handleOpenManualInput}
                  />
                </View>
              </View>

              {/* ネットワーク権限ガイド - 下部エリア */}
              <View className="pb-2">
                <View className="bg-amber-50 border border-amber-200 rounded-3xl p-4 mb-4">
                  <Text className="text-amber-800 text-sm leading-5 text-center font-medium">
                    You must allow the "Network Permission" to use this app.
                  </Text>
                </View>
                <Button
                  title="Go to Setting"
                  icon={
                    <MaterialIcons name="settings" size={18} color="#ffffff" />
                  }
                  variant="primary"
                  onPress={async () => {
                    try {
                      await Linking.openSettings();
                    } catch (error) {
                      AlertManager.showAlert('エラー', '設定アプリを開けませんでした');
                    }
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          /* 接続後の画面は別のコンポーネントで表示 */
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">
              接続済み - 実行画面に移動します
            </Text>
          </View>
        )}
      </View>

      {/* QRスキャナーを直接レンダリング（Modalなし） */}
      {showQRScanner && (
        <View className="absolute inset-0 z-50">
          <QRScanner
            onQRCodeScanned={handleQRCodeScanned}
            onClose={handleCloseQRScanner}
            isVisible={showQRScanner}
          />
        </View>
      )}

      {/* 手動入力を直接レンダリング（Modalなし） */}
      {showManualInput && (
        <View className="absolute inset-0 z-50">
          <ConnectionSetup
            onConnect={onConnect}
            isVisible={showManualInput}
            onClose={handleCloseManualInput}
          />
        </View>
      )}
    </View>
  );
};