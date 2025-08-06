import React, { useState } from 'react';
import { View, Text, Linking, ScrollView } from 'react-native';
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
  onDisconnect: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  isConnected,
  onSettingsPress,
  onConnect,
  onDisconnect,
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
    
    const connectionParams = DeepLinkService.parseConnectionURL(data);
    console.log('📱 Parsed connection params:', connectionParams);

    setShowQRScanner(false);

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
    <View className="flex-1 bg-neutral-50">
      <Header
        title="Side Assist Plus"
        subtitle="PC Connection Assistant"
        showSettings={true}
        onSettingsPress={onSettingsPress}
      />

      <ScrollView 
        className="flex-1" 
        contentContainerClassName="min-h-full"
        showsVerticalScrollIndicator={false}
      >
        {/* Status Section */}
        <View className="px-6 py-4">
          <StatusIndicator isConnected={isConnected} variant="detailed" />
        </View>

        {!isConnected ? (
          <>
            {/* Hero Section */}
            <View className="px-6 py-8">
              <View className="bg-white rounded-3xl p-8 shadow-soft">
                <View className="items-center">
                  {/* Hero Icon */}
                  <View className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl items-center justify-center mb-6 shadow-medium">
                    <MaterialIcons name="devices" size={40} color="#0ea5e9" />
                  </View>

                  {/* Hero Text */}
                  <Text className="text-2xl font-bold text-neutral-900 text-center mb-3">
                    PCと接続
                  </Text>
                  <Text className="text-base text-neutral-600 text-center leading-relaxed mb-8">
                    QRコードをスキャンして{'\n'}簡単に接続できます
                  </Text>

                  {/* Action Buttons */}
                  <View className="w-full space-y-4">
                    <Button
                      title="Scan QR Code"
                      icon={<MaterialIcons name="qr-code-scanner" size={20} />}
                      variant="primary"
                      size="lg"
                      onPress={handleOpenQRScanner}
                    />

                    <View className="flex-row items-center justify-center py-4">
                      <View className="flex-1 h-px bg-neutral-200" />
                      <Text className="mx-4 text-sm text-neutral-400 font-medium">
                        または
                      </Text>
                      <View className="flex-1 h-px bg-neutral-200" />
                    </View>

                    <Button
                      title="Manual Input"
                      icon={<MaterialIcons name="keyboard" size={20} />}
                      variant="outline"
                      size="lg"
                      onPress={handleOpenManualInput}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Info Cards */}
            <View className="px-6 pb-8">
              <View className="bg-white rounded-3xl p-6 shadow-soft">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-primary-100 rounded-2xl items-center justify-center mr-4 mt-1">
                    <MaterialIcons name="info-outline" size={20} color="#0ea5e9" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-neutral-900 mb-2">
                      接続のヒント
                    </Text>
                    <Text className="text-neutral-600 leading-relaxed mb-4">
                      PCとスマートフォンが同じWi-Fiネットワークに接続されていることを確認してください。
                    </Text>
                    <Button
                      title="Wi-Fi設定を開く"
                      icon={<MaterialIcons name="wifi" size={18} />}
                      variant="ghost"
                      size="sm"
                      fullWidth={false}
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
              </View>
            </View>

            {/* Network Permission Notice */}
            <View className="px-6 pb-8">
              <View className="bg-warning-50 border border-warning-200 rounded-3xl p-6">
                <View className="flex-row items-start">
                  <MaterialIcons name="security" size={24} color="#ca8a04" />
                  <View className="flex-1 ml-3">
                    <Text className="text-warning-800 font-semibold mb-2">
                      ネットワーク権限が必要です
                    </Text>
                    <Text className="text-warning-700 text-sm leading-relaxed">
                      アプリを使用するには、ネットワーク権限を許可してください。
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white rounded-3xl p-8 shadow-soft w-full">
              <View className="items-center">
                <View className="w-16 h-16 bg-success-100 rounded-2xl items-center justify-center mb-4">
                  <MaterialIcons name="check-circle" size={32} color="#16a34a" />
                </View>
                <Text className="text-xl font-bold text-neutral-900 mb-2">
                  接続完了
                </Text>
                <Text className="text-neutral-600 text-center mb-6">
                  PCとの接続が確立されました
                </Text>
                
                {/* 接続解除ボタン */}
                <Button
                  title="接続を解除"
                  icon={<MaterialIcons name="link-off" size={20} />}
                  variant="outline"
                  size="md"
                  onPress={() => {
                    // 確認ダイアログを表示
                    AlertManager.showAlert(
                      '接続解除の確認',
                      'PCとの接続を解除しますか？',
                      [
                        {
                          text: 'キャンセル',
                          style: 'cancel',
                        },
                        {
                          text: '解除',
                          style: 'destructive',
                          onPress: () => {
                            console.log('🔌 [HomeScreen] User confirmed disconnect');
                            onDisconnect();
                          },
                        },
                      ]
                    );
                  }}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {showQRScanner && (
        <View className="absolute inset-0 z-50">
          <QRScanner
            onQRCodeScanned={handleQRCodeScanned}
            onClose={handleCloseQRScanner}
            isVisible={showQRScanner}
          />
        </View>
      )}

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