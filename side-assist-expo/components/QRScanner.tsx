import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Device from "expo-device";
import { Header } from "./ui";
import { MaterialIcons } from "@expo/vector-icons";

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

  // スキャナー開始時にリセット
  useEffect(() => {
    if (isVisible) {
      setLastScannedCode(null);
      setIsProcessing(false);
    }
  }, [isVisible]);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      // 処理中または同じコードの場合は無視
      if (isProcessing || data === lastScannedCode) {
        return;
      }

      setLastScannedCode(data);
      setIsProcessing(true);

      // 親コンポーネントに処理を委譲
      onQRCodeScanned(data);

      // より長い時間で処理完了後にリセット
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    },
    [isProcessing, lastScannedCode, onQRCodeScanned],
  );

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
  const isSimulator = Platform.OS === "ios" && !Device.isDevice;
  if (isSimulator) {
    const handleTestScan = () => {
      const testQRData =
        "sideassist://connect?ip=192.168.1.100&port=8080&password=12345";
      onQRCodeScanned(testQRData);
    };

    return (
      <View style={styles.container}>
        <Header
          title="QRコードスキャン"
          showClose={true}
          onClosePress={onClose}
        />
        <View style={styles.centerContent}>
          <MaterialIcons name="smartphone" size={80} color="#6b7280" />
          <Text style={styles.title}>シミュレーター環境</Text>
          <Text style={styles.description}>
            iOSシミュレーターではカメラ機能を使用できません。{"\\n"}
            実際のiOS端末でテストしてください。
          </Text>
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
      />

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={!isProcessing ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanText}>
            {isProcessing
              ? "QRコードを処理中..."
              : "PCのQRコードを枠内に合わせてください"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#6db8ff",
    borderRadius: 24,
    elevation: 3,
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonSecondary: {
    backgroundColor: "#9ca3af",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonSecondaryText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    backgroundColor: "#000000",
    flex: 1,
    position: "relative",
  },
  centerContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  description: {
    color: "#6b7280",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    textAlign: "center",
  },
  message: {
    color: "#374151",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  overlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  scanFrame: {
    backgroundColor: "transparent",
    borderColor: "#6db8ff",
    borderRadius: 8,
    borderWidth: 4,
    height: 240,
    width: 240,
  },
  scanText: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 4,
    color: "#ffffff",
    fontSize: 16,
    marginTop: 32,
    paddingHorizontal: 20,
    paddingVertical: 8,
    textAlign: "center",
  },
  title: {
    color: "#374151",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
});
