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

  const connectionSetupStyles = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      alignItems: 'center' as const,
      marginBottom: 24,
    },
    headerIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#1a1a1a',
      textAlign: 'center' as const,
    },
    headerSubtitle: {
      fontSize: 16,
      color: '#666666',
      textAlign: 'center' as const,
      marginTop: 8,
      lineHeight: 22,
    },
    primaryButton: {
      backgroundColor: '#007AFF',
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      marginBottom: 16,
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    },
    divider: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginVertical: 20,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#e0e0e0',
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: '#999999',
      fontWeight: '500' as const,
    },
    secondaryButton: {
      backgroundColor: '#f8f9fa',
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: '#e9ecef',
    },
    secondaryButtonText: {
      color: '#495057',
      fontSize: 16,
      fontWeight: '600' as const,
      textAlign: 'center' as const,
    },
  };

  return (
    <View style={connectionSetupStyles.container}>
      <View style={connectionSetupStyles.header}>
        <Text style={connectionSetupStyles.headerIcon}>📱</Text>
        <Text style={connectionSetupStyles.headerTitle}>PCと接続</Text>
        <Text style={connectionSetupStyles.headerSubtitle}>
          QRコードをスキャンして{'{\n}'}簡単に接続できます
        </Text>
      </View>

      {!showManualInput ? (
        // QRコード優先画面
        <>
          <TouchableOpacity
            style={connectionSetupStyles.primaryButton}
            onPress={handleOpenQRScanner}
            disabled={isConnecting}
          >
            <Text style={connectionSetupStyles.primaryButtonText}>
              📷 QRコードをスキャン
            </Text>
          </TouchableOpacity>

          <View style={connectionSetupStyles.divider}>
            <View style={connectionSetupStyles.dividerLine} />
            <Text style={connectionSetupStyles.dividerText}>または</Text>
            <View style={connectionSetupStyles.dividerLine} />
          </View>

          <TouchableOpacity
            style={connectionSetupStyles.secondaryButton}
            onPress={() => setShowManualInput(true)}
            disabled={isConnecting}
          >
            <Text style={connectionSetupStyles.secondaryButtonText}>
              ⌨️ 手動で入力
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        // 手動入力画面
        <>
          <View style={connectionSetupStyles.header}>
            <Text style={connectionSetupStyles.headerIcon}>⌨️</Text>
            <Text style={connectionSetupStyles.headerTitle}>手動接続</Text>
            <Text style={connectionSetupStyles.headerSubtitle}>
              PCの接続情報を入力してください
            </Text>
          </View>

          <View style={connectionSetupStyles.formContainer}>
            <View style={connectionSetupStyles.formField}>
              <Text style={connectionSetupStyles.formLabel}>IPアドレス</Text>
              <TextInput
                style={connectionSetupStyles.textInput}
                value={ip}
                onChangeText={setIp}
                placeholder="例: 192.168.1.100"
                keyboardType="numeric"
                autoCapitalize="none"
                editable={!isConnecting}
                placeholderTextColor="#999999"
              />
            </View>

            <View style={connectionSetupStyles.formField}>
              <Text style={connectionSetupStyles.formLabel}>ポート</Text>
              <TextInput
                style={connectionSetupStyles.textInput}
                value={port}
                onChangeText={setPort}
                placeholder="8080"
                keyboardType="numeric"
                editable={!isConnecting}
                placeholderTextColor="#999999"
              />
            </View>

            <View style={connectionSetupStyles.formField}>
              <Text style={connectionSetupStyles.formLabel}>
                パスワード (5桁)
              </Text>
              <TextInput
                style={connectionSetupStyles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="12345"
                keyboardType="numeric"
                maxLength={5}
                editable={!isConnecting}
                placeholderTextColor="#999999"
              />
            </View>

            <View style={connectionSetupStyles.buttonRow}>
              <TouchableOpacity
                style={connectionSetupStyles.backButton}
                onPress={() => {
                  setShowManualInput(false);
                  setIp('');
                  setPort('8080');
                  setPassword('');
                }}
                disabled={isConnecting}
              >
                <Text style={connectionSetupStyles.buttonText}>戻る</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  connectionSetupStyles.connectButton,
                  (isConnecting ||
                    !ip.trim() ||
                    !port.trim() ||
                    password.length !== 5) &&
                    connectionSetupStyles.disabledButton,
                ]}
                onPress={handleManualConnect}
                disabled={
                  isConnecting ||
                  !ip.trim() ||
                  !port.trim() ||
                  password.length !== 5
                }
              >
                <Text style={connectionSetupStyles.buttonText}>
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
