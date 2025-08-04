import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
// import { statusStyles } from '../styles/commonStyles';

interface NetworkPermissionGuideProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const NetworkPermissionGuide: React.FC<NetworkPermissionGuideProps> = ({
  isVisible,
  onDismiss,
}) => {
  if (!isVisible) return null;

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>📶 ネットワーク権限が必要です</Text>

        <Text style={styles.description}>
          Side Assistがデスクトップと通信するため、以下の権限が必要です：
        </Text>

        <View style={styles.permissionList}>
          <Text style={styles.permissionItem}>
            • ローカルネットワーク使用許可
          </Text>
          <Text style={styles.permissionItem}>• ネットワークスキャン許可</Text>
        </View>

        <Text style={styles.steps}>権限を許可するには：</Text>

        <View style={styles.stepsList}>
          <Text style={styles.step}>1. 「設定を開く」をタップ</Text>
          <Text style={styles.step}>2. 「ローカルネットワーク」をオン</Text>
          <Text style={styles.step}>3. アプリに戻る</Text>
          <Text style={styles.step}>
            4. 「ネットワークを再スキャン」をタップ
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={openSettings}
          >
            <Text style={styles.settingsButtonText}>設定を開く</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>後で設定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = {
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center' as const,
    marginBottom: 16,
    lineHeight: 22,
  },
  permissionList: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  permissionItem: {
    fontSize: 14,
    color: '#00ff88',
    marginBottom: 8,
  },
  steps: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 12,
  },
  stepsList: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  step: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    paddingLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  settingsButton: {
    flex: 1,
    backgroundColor: '#00ff88',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  settingsButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  dismissButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center' as const,
  },
  dismissButtonText: {
    color: '#ccc',
    fontSize: 16,
  },
};
