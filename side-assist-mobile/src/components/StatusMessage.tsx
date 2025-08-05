import React from 'react';
import { View, Text } from 'react-native';

interface StatusMessageProps {
  isConnected: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  isConnected,
}) => {
  if (isConnected) return null;

  const statusMessageStyles = {
    container: {
      backgroundColor: '#fff3cd',
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#ffeaa7',
      alignItems: 'center' as const,
    },
    icon: {
      fontSize: 32,
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#856404',
      textAlign: 'center' as const,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: '#856404',
      textAlign: 'center' as const,
      opacity: 0.8,
    },
  };

  return (
    <View style={statusMessageStyles.container}>
      <Text style={statusMessageStyles.icon}>🔗</Text>
      <Text style={statusMessageStyles.title}>PCと接続していません</Text>
      <Text style={statusMessageStyles.subtitle}>
        下のQRコードスキャンボタンから接続してください
      </Text>
    </View>
  );
};
