import React from 'react';
import { View, Text, Modal, Linking, Alert } from 'react-native';
import { Header, Button } from './ui';
import { getDeviceConfig } from '../utils/DeviceConfig';

interface SettingsPanelProps {
  isVisible: boolean;
  isConnected: boolean;
  macIP: string;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  isConnected,
  macIP,
  onClose,
}) => {
  const deviceConfig = getDeviceConfig();
  
  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('エラー', '設定アプリを開けませんでした');
    }
  };
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <Header
          title="設定"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />
        
        <View className="flex-1 p-5">
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2">接続状態</Text>
            <Text className="text-gray-600">
              {isConnected ? `接続中: ${macIP}` : '未接続'}
            </Text>
          </View>
          
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-2">デバイス情報</Text>
            <Text className="text-gray-600 text-sm mb-1">
              デバイス名: {deviceConfig.deviceName}
            </Text>
            <Text className="text-gray-600 text-sm mb-1">
              デバッグモード: {deviceConfig.debugMode ? 'ON' : 'OFF'}
            </Text>
            <Text className="text-gray-600 text-sm">
              開発モード: {deviceConfig.developmentMode ? 'ON' : 'OFF'}
            </Text>
          </View>
          
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">ネットワーク権限設定</Text>
            <Text className="text-sm text-gray-700 mb-3 leading-5">
              PCとの接続に問題がある場合、ローカルネットワーク権限を確認してください。
            </Text>
            <Text className="text-sm text-gray-600 mb-4 leading-5">
              設定 → プライバシーとセキュリティ → ローカルネットワーク → Side Assist Plus をオン
            </Text>
            <Button
              title="設定アプリを開く"
              onPress={handleOpenSettings}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};