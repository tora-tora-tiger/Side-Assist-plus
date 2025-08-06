import React from 'react';
import { View, Text } from 'react-native';

interface StatusIndicatorProps {
  isConnected: boolean;
  showDot?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isConnected,
  showDot = true,
}) => {
  const getStatusStyle = () => {
    return isConnected ? 'bg-figma-success' : 'bg-figma-warning';
  };

  const getDotStyle = () => {
    return isConnected ? 'bg-figma-success-bright' : 'bg-figma-danger';
  };

  const getStatusText = () => {
    return isConnected ? 'Connected' : 'Not Connected';
  };

  return (
    <View className={`rounded-3xl px-6 py-4 ${getStatusStyle()}`}>
      <View className="flex-row items-center justify-center">
        {showDot && (
          <View className={`w-4 h-4 rounded-full mr-3 ${getDotStyle()}`} />
        )}
        <Text className="text-black text-lg font-medium">
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
};