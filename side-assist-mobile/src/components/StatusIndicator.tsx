import React from 'react';
import { View } from 'react-native';

interface StatusIndicatorProps {
  isConnected: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isConnected,
}) => (
  <View className="items-center mt-4">
    <View
      className={`w-3 h-3 rounded-full ${
        isConnected
          ? 'bg-success shadow-lg shadow-success/25'
          : 'bg-gray-300 shadow-lg shadow-gray-300/25'
      }`}
    />
  </View>
);
