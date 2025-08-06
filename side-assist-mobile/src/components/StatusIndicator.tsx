import React from 'react';
import { View } from 'react-native';

interface StatusIndicatorProps {
  isConnected: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isConnected,
}) => (
  <View className="absolute top-15 left-5 w-5 h-5 justify-center items-center z-50">
    <View
      className={`w-3 h-3 rounded-full ${
        isConnected ? 'bg-success' : 'bg-gray-600'
      }`}
    />
  </View>
);
