import React from 'react';
import { View, Text } from 'react-native';
import { Header, Button } from './ui';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

interface SettingsPanelProps {
  isVisible: boolean;
  isConnected: boolean;
  macIP: string;
  onClose: () => void;
  onShowPermissionGuide?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  isConnected: _isConnected,
  macIP,
  onClose,
  onShowPermissionGuide,
}) => {
  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 bg-white z-20">
      <Header
        title="Setting"
        showClose={true}
        onClosePress={onClose}
        showShadow={true}
        backgroundColor="bg-white"
      />

      <View className="flex-1 px-5">
        {/* PC IP */}
        <View className="flex-row justify-between items-center py-4 border-b border-gray-300">
          <Text className="text-gray-800 text-base">PC IP</Text>
          <Text className="text-gray-800 text-base font-medium">
            {macIP || '192.168.1.21'}
          </Text>
        </View>

        {/* Permission セクション */}
        <View className="mt-6">
          <Text className="text-gray-800 text-lg font-semibold mb-4">
            Permission
          </Text>

          {/* Camera Permission */}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
            <Text className="text-gray-800 text-base">Camera</Text>
            <Text className="text-gray-800 text-base">granted</Text>
          </View>

          {/* Network Permission */}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-300">
            <Text className="text-gray-800 text-base">Network</Text>
            <Text className="text-gray-800 text-base">not granted</Text>
          </View>
        </View>

        {/* Go to Setting ボタン */}
        <View className="mt-8">
          <Button
            title="Go to Setting"
            variant="primary"
            onPress={onShowPermissionGuide || (() => {})}
            icon={<MaterialIcons name="settings" size={18} color="#ffffff" />}
          />
        </View>
      </View>
    </View>
  );
};
