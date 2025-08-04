import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { settingsStyles } from '../styles/settingsStyles';
import { statusStyles } from '../styles/commonStyles';

interface SettingsPanelProps {
  isVisible: boolean;
  isConnected: boolean;
  isSearching: boolean;
  macIP: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  isConnected,
  isSearching,
  macIP,
  onClose,
  onRefresh,
}) => {
  if (!isVisible) return null;

  return (
    <View style={settingsStyles.settingsPanel}>
      <TouchableOpacity style={settingsStyles.closeButton} onPress={onClose}>
        <Text style={settingsStyles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <Text style={settingsStyles.settingsTitle}>Connection</Text>

      <View style={settingsStyles.settingsRow}>
        <Text style={settingsStyles.settingsLabel}>Status</Text>
        <Text
          style={[
            settingsStyles.settingsValue,
            isConnected
              ? statusStyles.statusConnected
              : statusStyles.statusDisconnected,
          ]}
        >
          {isSearching
            ? 'Scanning...'
            : isConnected
            ? 'Connected'
            : 'Disconnected'}
        </Text>
      </View>

      {macIP && (
        <View style={settingsStyles.settingsRow}>
          <Text style={settingsStyles.settingsLabel}>Mac IP</Text>
          <Text style={settingsStyles.settingsValue}>{macIP}</Text>
        </View>
      )}

      <TouchableOpacity
        style={settingsStyles.refreshButton}
        onPress={onRefresh}
      >
        <Text style={settingsStyles.refreshButtonText}>🔍 Find Mac</Text>
      </TouchableOpacity>
    </View>
  );
};
