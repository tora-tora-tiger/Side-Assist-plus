import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Header, Button } from './ui';

interface SettingsPanelProps {
  isVisible: boolean;
  isConnected: boolean;
  macIP: string;
  onClose: () => void;
  onShowPermissionGuide: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  isConnected,
  macIP,
  onClose,
  onShowPermissionGuide,
}) => {
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
          
          <Button
            title="ネットワーク権限ガイド"
            onPress={onShowPermissionGuide}
            variant="secondary"
          />
        </View>
      </View>
    </Modal>
  );
};