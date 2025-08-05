import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SettingsPanelProps {
  isVisible: boolean;
  isConnected: boolean;
  macIP: string;
  onClose: () => void;
  onShowPermissionGuide?: () => void;
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
    <View className="absolute inset-0 bg-black/50 justify-center items-center z-40 p-5">
      <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
        <TouchableOpacity
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full justify-center items-center"
          onPress={onClose}
        >
          <Text className="text-gray-600 text-lg">✕</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-6 mt-2">
          接続情報
        </Text>

        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View
              className={`w-3 h-3 rounded-full mr-3 ${
                isConnected ? 'bg-success' : 'bg-gray-300'
              }`}
            />
            <Text className="text-lg font-medium text-gray-800">
              {isConnected ? '接続済み' : '未接続'}
            </Text>
          </View>

          {isConnected && macIP && (
            <Text className="text-sm text-gray-600 ml-6">IP: {macIP}</Text>
          )}
        </View>

        {onShowPermissionGuide && (
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 px-6 mb-4"
            onPress={onShowPermissionGuide}
          >
            <Text className="text-white text-base font-semibold text-center">
              📶 ネットワーク権限ガイド
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="bg-gray-100 rounded-2xl py-4 px-6"
          onPress={onClose}
        >
          <Text className="text-gray-700 text-base font-semibold text-center">
            閉じる
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
