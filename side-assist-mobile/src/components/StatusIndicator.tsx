import React from 'react';
import { View } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

interface StatusIndicatorProps {
  isConnected: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isConnected,
}) => (
  <View style={commonStyles.statusIndicator}>
    <View
      style={[
        commonStyles.connectionDot,
        isConnected
          ? commonStyles.connectionDotConnected
          : commonStyles.connectionDotDisconnected,
      ]}
    />
  </View>
);
