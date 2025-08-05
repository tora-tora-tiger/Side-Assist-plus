import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { QRScanner } from './QRScanner';
import { DeepLinkService } from '../services/DeepLinkService';
import AlertManager from '../utils/AlertManager';

interface ConnectionSetupProps {
  onConnect: (ip: string, port: string, password: string) => Promise<boolean>;
  isVisible: boolean;
}

export const ConnectionSetup: React.FC<ConnectionSetupProps> = ({
  onConnect,
  isVisible,
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('8080');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleManualConnect = async () => {
    if (!ip.trim() || !port.trim() || !password.trim()) {
      AlertManager.showAlert('入力エラー', 'すべての項目を入力してください');
      return;
    }

    if (password.length !== 5 || !/^\d{5}$/.test(password)) {
      AlertManager.showAlert(
        'パスワードエラー',
        'パスワードは5桁の数字で入力してください',
      );
      return;
    }

    try {
      setIsConnecting(true);
      const success = await onConnect(ip.trim(), port.trim(), password.trim());

      if (!success) {
        AlertManager.showAlert(
          '接続失敗',
          'PCに接続できませんでした。IPアドレス、ポート、パスワードを確認してください。',
        );
      } else {
        // Reset form on success
        setIp('');
        setPort('8080');
        setPassword('');
        setShowManualInput(false);
      }
    } catch (error) {
      AlertManager.showAlert('エラー', '接続中にエラーが発生しました');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOpenQRScanner = () => {
    AlertManager.clearQueue(); // アラートキューをクリア
    setShowQRScanner(true);
  };

  const handleQRCodeScanned = async (data: string) => {
    console.log('🔄 [ConnectionSetup] handleQRCodeScanned called - START');

    // アラートマネージャーによる重複チェック
    if (AlertManager.isShowing()) {
      console.log(
        '📱 Alert already showing via AlertManager, ignoring QR scan',
      );
      return;
    }

    console.log('📱 [ConnectionSetup] QR Code data received:', data);
    console.log('📱 [ConnectionSetup] Data type:', typeof data);
    console.log('📱 [ConnectionSetup] Data length:', data.length);
    console.log(
      '🚨 [ConnectionSetup] This function call should happen ONLY ONCE!',
    );

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
              // 少し遅延してからスキャナーを再開
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
      setIsConnecting(true);
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
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCloseQRScanner = () => {
    setShowQRScanner(false);
    AlertManager.clearQueue(); // アラートキューもクリア
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View className="bg-white rounded-4xl p-6 mx-5 mb-5 shadow-lg">
      <View className="items-center mb-6">
        <Text className="text-5xl mb-3">📱</Text>
        <Text className="text-2xl font-bold text-gray-900 text-center">
          PCと接続
        </Text>
        <Text className="text-base text-gray-600 text-center mt-2 leading-6">
          QRコードをスキャンして{'\n'}簡単に接続できます
        </Text>
      </View>

      {!showManualInput ? (
        // QRコード優先画面
        <>
          <TouchableOpacity
            className={`bg-primary rounded-2xl py-5 px-6 mb-4 shadow-lg ${
              isConnecting ? 'opacity-60' : ''
            }`}
            onPress={handleOpenQRScanner}
            disabled={isConnecting}
          >
            <Text className="text-white text-lg font-semibold text-center">
              📷 QRコードをスキャン
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center my-5">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-sm text-gray-400 font-medium">
              または
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <TouchableOpacity
            className={`bg-gray-50 rounded-2xl py-4 px-6 border border-gray-100 ${
              isConnecting ? 'opacity-60' : ''
            }`}
            onPress={() => setShowManualInput(true)}
            disabled={isConnecting}
          >
            <Text className="text-gray-600 text-base font-semibold text-center">
              ⌨️ 手動で入力
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        // 手動入力画面
        <>
          <View className="items-center mb-6">
            <Text className="text-5xl mb-3">⌨️</Text>
            <Text className="text-2xl font-bold text-gray-900 text-center">
              手動接続
            </Text>
            <Text className="text-base text-gray-600 text-center mt-2">
              PCの接続情報を入力してください
            </Text>
          </View>

          <View className="mt-5">
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                IPアドレス
              </Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-white"
                value={ip}
                onChangeText={setIp}
                placeholder="例: 192.168.1.100"
                keyboardType="numeric"
                autoCapitalize="none"
                editable={!isConnecting}
                placeholderTextColor="#999999"
              />
            </View>

            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                ポート
              </Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-base bg-white"
                value={port}
                onChangeText={setPort}
                placeholder="8080"
                keyboardType="numeric"
                editable={!isConnecting}
                placeholderTextColor="#999999"
              />
            </View>

            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                パスワード (5桁)
              </Text>
              <TextInput
                className="border border-gray-200 rounded-xl px-4 py-3 text-lg bg-white text-center font-mono tracking-widest"
                value={password}
                onChangeText={setPassword}
                placeholder="12345"
                keyboardType="numeric"
                maxLength={5}
                editable={!isConnecting}
                placeholderTextColor="#999999"
              />
            </View>

            <View className="flex-row justify-between mt-6 gap-3">
              <TouchableOpacity
                className={`flex-1 bg-gray-50 rounded-xl py-4 px-4 border border-gray-100 ${
                  isConnecting ? 'opacity-60' : ''
                }`}
                onPress={() => {
                  setShowManualInput(false);
                  setIp('');
                  setPort('8080');
                  setPassword('');
                }}
                disabled={isConnecting}
              >
                <Text className="text-base font-semibold text-center text-gray-700">
                  戻る
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl py-4 px-4 ${
                  isConnecting ||
                  !ip.trim() ||
                  !port.trim() ||
                  password.length !== 5
                    ? 'bg-gray-300'
                    : 'bg-primary'
                }`}
                onPress={handleManualConnect}
                disabled={
                  isConnecting ||
                  !ip.trim() ||
                  !port.trim() ||
                  password.length !== 5
                }
              >
                <Text className="text-base font-semibold text-center text-white">
                  {isConnecting ? '接続中...' : '接続'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* QRスキャナーモーダル */}
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
    </View>
  );
};
