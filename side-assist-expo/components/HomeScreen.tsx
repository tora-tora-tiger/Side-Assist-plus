import React, { useState } from 'react';
import { View, Text, Modal, Linking } from 'react-native';
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
    setShowQRScanner(true);
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
  };

  const handleQRCodeScanned = async (data: string) => {
    console.log('📱 [HomeScreen] QR Code scanned:', data);
    
    // QRスキャナーを閉じる
    setShowQRScanner(false);

    // QRコードからURL解析
    const connectionParams = DeepLinkService.parseConnectionURL(data);
    console.log('📱 Parsed connection params:', connectionParams);

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
              }, 100);
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
      <View className="flex-1 px-5">
        {!isConnected ? (
          <>
            {/* 接続前の画面 */}
            <View className="flex-1 justify-center">
              <View className="items-center mb-8">
                <View className="mb-4">
                  <MaterialIcons name="smartphone" size={64} color="#6b7280" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 text-center">
                  PCと接続
                </Text>
                <Text className="text-base text-gray-600 text-center mt-2 leading-6">
                  QRコードをスキャンして{'\\n'}簡単に接続できます
                </Text>
              </View>

              <View className="space-y-4">
                {/* QRスキャンボタン */}
                <Button
                  title="Scan the QR Code"
                  icon={
                    <MaterialIcons name="qr-code" size={18} color="#ffffff" />
                  }
                  variant="primary"
                  onPress={handleOpenQRScanner}
                />

                {/* 区切り線 */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-4 text-sm text-gray-500 font-medium">
                    or
                  </Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                {/* 手動入力ボタン */}
                <Button
                  title="Input Manually"
                  icon={
                    <MaterialIcons name="keyboard" size={18} color="#374151" />
                  }
                  variant="secondary"
                  onPress={handleOpenManualInput}
                />
              </View>
            </View>

            {/* ネットワーク権限ガイド */}
            <View className="mb-5">
              <View className="bg-figma-yellow rounded-3xl p-6">
                <Text className="text-black text-base leading-6 text-center">
                  You must allow the "Network Permission" to use this app.
                </Text>
              </View>
              <View className="mt-4">
                <Button
                  title="Go to Setting"
                  icon={
                    <MaterialIcons name="settings" size={16} color="#ffffff" />
                  }
                  variant="primary"
                  size="small"
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

      {/* QRスキャナーモーダル */}
      {showQRScanner && (
        <Modal
          visible={showQRScanner}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <QRScanner
            onQRCodeScanned={handleQRCodeScanned}
            onClose={handleCloseQRScanner}
            isVisible={showQRScanner}
          />
        </Modal>
      )}

      {/* 手動入力モーダル */}
      {showManualInput && (
        <Modal
          visible={showManualInput}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <ConnectionSetup
            onConnect={onConnect}
            isVisible={showManualInput}
            onClose={handleCloseManualInput}
          />
        </Modal>
      )}
    </View>
  );
};