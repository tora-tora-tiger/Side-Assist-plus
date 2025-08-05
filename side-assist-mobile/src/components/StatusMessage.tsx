import React from 'react';
import { View, Text } from 'react-native';

interface StatusMessageProps {
  isConnected: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  isConnected,
}) => {
  if (isConnected) return null;

  return (
    <View className="bg-warning/10 rounded-2xl p-5 mx-5 mb-4 border border-warning/30 items-center">
      <Text className="text-3xl mb-2">🔗</Text>
      <Text className="text-lg font-semibold text-warning-800 text-center mb-1">
        PCと接続していません
      </Text>
      <Text className="text-sm text-warning-700 text-center opacity-80">
        下のQRコードスキャンボタンから接続してください
      </Text>
    </View>
  );
};
