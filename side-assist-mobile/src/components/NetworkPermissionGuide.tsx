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
    <View className="absolute inset-0 bg-black/80 justify-center items-center z-50 p-5">
      <View className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm border border-gray-700">
        <Text className="text-xl font-bold text-white text-center mb-4">
          📶 ネットワーク権限が必要です
        </Text>

        <Text className="text-base text-gray-300 text-center mb-4 leading-6">
          Side Assistがデスクトップと通信するため、以下の権限が必要です：
        </Text>

        <View className="bg-gray-800 rounded-2xl p-4 mb-4">
          <Text className="text-sm text-success mb-2">
            • ローカルネットワーク使用許可
          </Text>
          <Text className="text-sm text-success">
            • ネットワークスキャン許可
          </Text>
        </View>

        <Text className="text-base font-semibold text-white mb-3">
          権限を許可するには：
        </Text>

        <View className="bg-gray-800 rounded-2xl p-4 mb-6">
          <Text className="text-sm text-gray-300 mb-2 pl-2">
            1. 「設定を開く」をタップ
          </Text>
          <Text className="text-sm text-gray-300 mb-2 pl-2">
            2. 「ローカルネットワーク」をオン
          </Text>
          <Text className="text-sm text-gray-300 mb-2 pl-2">
            3. アプリに戻る
          </Text>
          <Text className="text-sm text-gray-300 pl-2">
            4. 「ネットワークを再スキャン」をタップ
          </Text>
        </View>

        <View className="flex-row justify-between gap-3">
          <TouchableOpacity
            className="flex-1 bg-success py-3 px-4 rounded-2xl items-center"
            onPress={openSettings}
          >
            <Text className="text-black text-base font-semibold">
              設定を開く
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-transparent py-3 px-4 rounded-2xl border border-gray-600 items-center"
            onPress={onDismiss}
          >
            <Text className="text-gray-300 text-base">後で設定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
