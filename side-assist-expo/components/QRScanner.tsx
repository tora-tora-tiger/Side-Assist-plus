import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { Header } from './ui';
import { MaterialIcons } from '@expo/vector-icons';
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
  const [permission, requestPermission] = useCameraPermissions();
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [processingLock, setProcessingLock] = useState(false);

  // スキャナー開始時にリセット
  useEffect(() => {
    if (isVisible) {
      setLastScannedCode(null);
      setIsProcessing(false);
      setScannerEnabled(true);
      setProcessingLock(false);
    }
  }, [isVisible]);

  const handleBarcodeScanned = useCallback(({ data }: { data: string }) => {
    // 複数の条件でスキャン処理をブロック
    if (
      !data ||
      isProcessing ||
      !scannerEnabled ||
      processingLock ||
      AlertManager.isShowing()
    ) {
      return;
    }

    // 同じコードの連続スキャンを防ぐ
    if (data === lastScannedCode) {
      console.log('📱 Same QR code scanned, ignoring');
      return;
    }

    console.log('📱 [QRScanner] QR Code scanned - SINGLE SCAN EVENT');
    console.log('  Raw value:', JSON.stringify(data));
    console.log('  Length:', data.length);
    console.log('  Scanner state before processing:', {
      isProcessing,
      scannerEnabled,
      processingLock,
    });
    console.log('  ⚠️ This log should appear ONLY ONCE per QR scan!');

    setLastScannedCode(data);
    setIsProcessing(true);
    setScannerEnabled(false);
    setProcessingLock(true);

    // 少し遅延を入れてから処理
    setTimeout(() => {
      onQRCodeScanned(data);
      setIsProcessing(false);
    }, 100);
  }, [isProcessing, scannerEnabled, processingLock, lastScannedCode, onQRCodeScanned]);

  if (!isVisible) {
    return null;
  }

  // 権限チェック中
  if (!permission) {
    return (
      <View style={styles.container}>
        <Header
          title="QRコードスキャン"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />
        <View style={styles.centerContent}>
          <Text style={styles.message}>カメラ権限を確認中...</Text>
        </View>
      </View>
    );
  }

  // 権限が拒否されている場合
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Header
          title="QRコードスキャン"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />
        <View style={styles.centerContent}>
          <MaterialIcons name="camera-alt" size={80} color="#6b7280" />
          <Text style={styles.title}>カメラへのアクセスが必要です</Text>
          <Text style={styles.description}>
            QRコードをスキャンするためにカメラへのアクセスを許可してください
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>カメラを許可する</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onClose}>
            <Text style={styles.buttonSecondaryText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // シミュレーター環境の場合
  const isSimulator = Platform.OS === 'ios' && !Device.isDevice;
  if (isSimulator) {
    const handleTestScan = () => {
      const testQRData = 'sideassist://connect?ip=192.168.1.100&port=8080&password=12345';
      onQRCodeScanned(testQRData);
    };

    return (
      <View style={styles.container}>
        <Header
          title="QRコードスキャン"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />
        <View style={styles.centerContent}>
          <MaterialIcons name="smartphone" size={80} color="#6b7280" />
          <Text style={styles.title}>シミュレーター環境</Text>
          <Text style={styles.description}>
            iOSシミュレーターではカメラ機能を使用できません。{'\n'}
            実際のiOS端末でテストしてください。
          </Text>
          <View style={styles.testSection}>
            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={16} color="#374151" />
              <Text style={styles.infoTitle}>テスト機能:</Text>
            </View>
            <Text style={styles.infoText}>
              下のボタンでテスト用QRコードをシミュレート
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleTestScan}>
            <Text style={styles.buttonText}>テスト接続をシミュレート</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onClose}>
            <Text style={styles.buttonSecondaryText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // カメラビュー
  return (
    <View style={styles.container}>
      <Header
        title="QRコードスキャン"
        showClose={true}
        onClosePress={onClose}
        showShadow={true}
      />

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scannerEnabled ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        <View style={styles.overlay}>
          {/* Figmaデザインに合わせた青い枠 */}
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>
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
    backgroundColor: '#ffffff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000000',
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
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 4,
    borderColor: '#6db8ff',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    borderRadius: 4,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#374151',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  testSection: {
    backgroundColor: '#fffad0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoText: {
    color: '#6b7280',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6db8ff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#9ca3af',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
  },
  buttonSecondaryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});