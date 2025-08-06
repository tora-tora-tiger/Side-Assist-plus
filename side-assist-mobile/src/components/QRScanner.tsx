import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { Header } from './ui';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import AlertManager from '../utils/AlertManager';

interface QRScannerProps {
  onQRCodeScanned: (data: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onQRCodeScanned,
  onClose,
  isVisible,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [processingLock, setProcessingLock] = useState(false);
  const device = useCameraDevice('back');

  // デバッグ用ログ
  useEffect(() => {
    console.log('📷 [DEBUG] Camera device:', {
      device,
      deviceId: device?.id,
      hasDevice: !!device,
      platform: Platform.OS,
    });

    // 利用可能なデバイスを直接取得してログ出力
    (async () => {
      try {
        const availableDevices = await Camera.getAvailableCameraDevices();
        console.log('📷 [DEBUG] Available camera devices:', availableDevices);
      } catch (error) {
        console.error('📷 [ERROR] Failed to get camera devices:', error);
      }
    })();
  }, [device]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      // 複数の条件でスキャン処理をブロック
      if (
        codes.length === 0 ||
        !codes[0].value ||
        isProcessing ||
        !scannerEnabled ||
        processingLock ||
        AlertManager.isShowing()
      ) {
        return;
      }

      const scannedValue = codes[0].value;

      // 同じコードの連続スキャンを防ぐ
      if (scannedValue === lastScannedCode) {
        console.log('📱 Same QR code scanned, ignoring');
        return;
      }

      console.log('📱 [QRScanner] QR Code scanned - SINGLE SCAN EVENT');
      console.log('  Raw value:', JSON.stringify(scannedValue));
      console.log('  Length:', scannedValue.length);
      console.log('  Scanner state before processing:', {
        isProcessing,
        scannerEnabled,
        processingLock,
      });
      console.log('  ⚠️ This log should appear ONLY ONCE per QR scan!');

      setLastScannedCode(scannedValue);
      setIsProcessing(true);
      setScannerEnabled(false);
      setProcessingLock(true); // 処理ロックを設定

      // 少し遅延を入れてから処理
      setTimeout(() => {
        onQRCodeScanned(scannedValue);
        setIsProcessing(false);
        // processingLockは親コンポーネントでリセットされるまで維持
      }, 100);
    },
  });

  const requestCameraPermission = useCallback(async () => {
    try {
      // まず現在の権限状態を確認
      const currentPermission = await Camera.getCameraPermissionStatus();
      console.log('📷 Current camera permission:', currentPermission);

      if (currentPermission === 'granted') {
        setHasPermission(true);
        return;
      }

      // 権限を要求
      const permission = await Camera.requestCameraPermission();
      console.log('📷 Requested camera permission result:', permission);

      if (permission === 'denied') {
        AlertManager.showAlert(
          'カメラ権限が必要です',
          'QRコードをスキャンするためにカメラへのアクセスを許可してください。設定アプリから手動で許可することもできます。',
          [
            { text: 'キャンセル', onPress: onClose },
            {
              text: '再試行',
              onPress: () => {
                requestCameraPermission();
              },
            },
          ],
        );
        setHasPermission(false);
      } else if (permission === 'granted') {
        setHasPermission(true);
      } else {
        // restricted や not-determined の場合
        setHasPermission(false);
      }
    } catch (error) {
      console.error('📷 Camera permission error:', error);
      setHasPermission(false);
    }
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      requestCameraPermission();
      // スキャナー開始時にリセット
      setLastScannedCode(null);
      setIsProcessing(false);
      setScannerEnabled(true);
      setProcessingLock(false); // 処理ロックもリセット
    }
  }, [isVisible, requestCameraPermission]);

  if (!isVisible) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-white">
        <Header
          title="Scan QR Code"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-800 text-base text-center m-5">
            カメラ権限を確認中...
          </Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 bg-white">
        <Header
          title="Scan QR Code"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-gray-800 text-base text-center mb-5">
            カメラへのアクセスが拒否されました
          </Text>
          <TouchableOpacity
            className="bg-primary p-4 rounded-lg m-2 items-center"
            onPress={requestCameraPermission}
          >
            <Text className="text-white text-base font-bold">権限を再要求</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-400 p-4 rounded-lg m-2 items-center"
            onPress={onClose}
          >
            <Text className="text-white text-base font-bold">キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // デバイス状態の詳細チェック
  const isSimulator = Platform.OS === 'ios' && __DEV__ && !device;
  const isRealDevice = Platform.OS === 'ios' && !__DEV__;

  if (!device) {
    return (
      <View className="flex-1 bg-white">
        <Header
          title="Scan QR Code"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />

        <View className="flex-1 justify-center items-center px-10">
          {isSimulator ? (
            <>
              <View className="mb-6">
                <MaterialIcons name="smartphone" size={80} color="#6b7280" />
              </View>
              <Text className="text-gray-800 text-2xl font-bold mb-4 text-center">
                シミュレーター環境
              </Text>
              <Text className="text-gray-600 text-base text-center leading-6 mb-8">
                iOSシミュレーターではカメラ機能を使用できません。{'\n'}
                実際のiOS端末でテストしてください。
              </Text>
              <View className="bg-gray-100 p-5 rounded-xl mb-8 w-full">
                <View className="flex-row items-center mb-3">
                  <MaterialIcons name="smartphone" size={16} color="#374151" />
                  <Text className="text-gray-800 text-base font-bold ml-2">
                    テスト用のヒント:
                  </Text>
                </View>
                <Text className="text-gray-600 text-sm mb-1">
                  • 物理的なiOS端末を使用
                </Text>
                <Text className="text-gray-600 text-sm mb-1">
                  • 手動入力で接続をテスト
                </Text>
                <Text className="text-gray-600 text-sm">
                  • PCのQRコード生成は正常動作
                </Text>
              </View>
            </>
          ) : (
            <>
              <View className="mb-6">
                <MaterialIcons name="error-outline" size={80} color="#ef4444" />
              </View>
              <Text className="text-error text-2xl font-bold mb-4 text-center">
                {isRealDevice
                  ? 'カメラデバイスが見つかりません'
                  : 'カメラが見つかりません'}
              </Text>
              <Text className="text-gray-600 text-base text-center leading-6 mb-8">
                {isRealDevice ? (
                  <>
                    実機でカメラデバイスが検出されません。{'\n'}
                    以下を確認してください：{'\n\n'}•
                    カメラ権限が許可されているか{'\n'}• アプリの再起動{'\n'}•
                    iOS設定 &#8594; プライバシー &#8594; カメラ{'\n'}•
                    デバイスの再起動
                  </>
                ) : (
                  <>
                    カメラデバイスにアクセスできません。{'\n'}
                    アプリを再起動してお試しください。
                  </>
                )}
              </Text>
            </>
          )}

          <TouchableOpacity
            className="bg-primary p-4 rounded-lg items-center"
            onPress={onClose}
          >
            <Text className="text-white text-base font-bold">閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title="Scan QR Code"
        showClose={true}
        onClosePress={onClose}
        showShadow={true}
      />

      <View className="flex-1 relative bg-black">
        <Camera
          className="flex-1"
          device={device}
          isActive={isVisible}
          codeScanner={codeScanner}
        />

        <View className="absolute inset-0 justify-center items-center">
          {/* Figmaデザインに合わせた青い枠 */}
          <View className="w-60 h-60 border-4 border-figma-blue rounded-lg bg-transparent" />
          <Text className="text-white text-base text-center mt-8 px-5 bg-black/70 py-2 rounded">
            {isProcessing
              ? 'QRコードを処理中...'
              : 'PCのQRコードを枠内に合わせてください'}
          </Text>
          {isProcessing && (
            <View className="absolute inset-0 bg-black/70 justify-center items-center">
              <Text className="text-white text-lg font-bold">処理中...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
