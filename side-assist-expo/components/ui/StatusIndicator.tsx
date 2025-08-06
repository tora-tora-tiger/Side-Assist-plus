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
    return isConnected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200';
  };

  const getDotStyle = () => {
    return isConnected ? 'bg-green-500' : 'bg-red-500';
  };

  const getTextStyle = () => {
    return isConnected ? 'text-green-800' : 'text-orange-800';
  };

  const getStatusText = () => {
    return isConnected ? 'Connected' : 'Not Connected';
  };

  return (
    <View className={`rounded-3xl px-6 py-4 border ${getStatusStyle()}`}>
      <View className="flex-row items-center justify-center">
        {showDot && (
          <View className={`w-3 h-3 rounded-full mr-3 ${getDotStyle()}`} />
        )}
        <Text className={`text-base font-semibold ${getTextStyle()}`}>
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
};