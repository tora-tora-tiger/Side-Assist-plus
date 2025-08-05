import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
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
      <View style={styles.container}>
        <Text style={styles.message}>カメラ権限を確認中...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>カメラへのアクセスが拒否されました</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestCameraPermission}
        >
          <Text style={styles.buttonText}>権限を再要求</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>キャンセル</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // デバイス状態の詳細チェック
  const isSimulator = Platform.OS === 'ios' && __DEV__ && !device;
  const isRealDevice = Platform.OS === 'ios' && !__DEV__;

  if (!device) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>QRコードスキャン</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
          {isSimulator ? (
            <>
              <Text style={styles.simulatorIcon}>📱</Text>
              <Text style={styles.simulatorTitle}>シミュレーター環境</Text>
              <Text style={styles.simulatorMessage}>
                iOSシミュレーターではカメラ機能を使用できません。{'\n'}
                実際のiOS端末でテストしてください。
              </Text>
              <View style={styles.simulatorTips}>
                <Text style={styles.tipsTitle}>💡 テスト用のヒント:</Text>
                <Text style={styles.tipsText}>• 物理的なiOS端末を使用</Text>
                <Text style={styles.tipsText}>• 手動入力で接続をテスト</Text>
                <Text style={styles.tipsText}>
                  • PCのQRコード生成は正常動作
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.errorTitle}>
                {isRealDevice
                  ? 'カメラデバイスが見つかりません'
                  : 'カメラが見つかりません'}
              </Text>
              <Text style={styles.errorMessage}>
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

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QRコードをスキャン</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={isVisible}
          codeScanner={codeScanner}
        />

        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.instruction}>
            {isProcessing
              ? 'QRコードを処理中...'
              : 'PCのQRコードを枠内に合わせてください'}
          </Text>
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Text style={styles.processingText}>処理中...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    borderRadius: 5,
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  simulatorIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  simulatorTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  simulatorMessage: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  simulatorTips: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  tipsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipsText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
