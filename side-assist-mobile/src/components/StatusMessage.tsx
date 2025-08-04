import React from 'react';
import { View, Text } from 'react-native';
import { statusStyles } from '../styles/commonStyles';

interface StatusMessageProps {
  isConnected: boolean;
  isSearching: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  isConnected,
  isSearching,
}) => {
  if (isConnected) return null;

  return (
    <View style={statusStyles.statusMessage}>
      <Text style={statusStyles.statusIcon}>⚠️</Text>
      <Text style={statusStyles.statusText}>
        {isSearching ? 'Searching for Mac...' : 'Mac not found'}
      </Text>
      <Text style={statusStyles.statusSubtext}>
        {isSearching ? 'Please wait' : 'Tap settings to connect'}
      </Text>
    </View>
  );
};
