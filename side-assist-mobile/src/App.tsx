import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  Animated,
  Alert,
} from 'react-native';

import { useConnection } from './hooks/useConnection';
import { StatusIndicator } from './components/StatusIndicator';
import { StatusMessage } from './components/StatusMessage';
import { MainButton } from './components/MainButton';
import { SettingsPanel } from './components/SettingsPanel';
import { NetworkPermissionGuide } from './components/NetworkPermissionGuide';
import { commonStyles, buttonStyles } from './styles/commonStyles';

const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  const {
    isConnected,
    macIP,
    isSearching,
    showPermissionGuide,
    startConnectionMonitoring,
    stopConnectionMonitoring,
    scanForServer,
    sendText,
    dismissPermissionGuide,
  } = useConnection();

  useEffect(() => {
    console.log('🚀 [DEBUG] App component mounted');
    scanForServer();
    startConnectionMonitoring();

    return () => {
      console.log('🛑 [DEBUG] App component unmounting');
      stopConnectionMonitoring();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendText = async (text: string) => {
    try {
      const success = await sendText(text);
      if (success) {
        console.log(`✅ Text sent successfully: "${text}"`);
      } else {
        Alert.alert('Failed', 'Could not send text to Mac');
      }
    } catch (error) {
      console.error('Send text error:', error);
      Alert.alert('Error', 'Failed to send text');
    }
  };

  return (
    <View style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <StatusIndicator isConnected={isConnected} />

      <TouchableOpacity
        style={buttonStyles.settingsButton}
        onPress={() => setShowSettings(!showSettings)}
      >
        <Text style={buttonStyles.settingsIcon}>⚪</Text>
      </TouchableOpacity>

      <View style={commonStyles.content}>
        <StatusMessage isConnected={isConnected} isSearching={isSearching} />

        <MainButton
          isConnected={isConnected}
          buttonScale={buttonScale}
          onPress={handleSendText}
        />
      </View>

      <SettingsPanel
        isVisible={showSettings}
        isConnected={isConnected}
        isSearching={isSearching}
        macIP={macIP}
        onClose={() => setShowSettings(false)}
        onRefresh={scanForServer}
      />

      <NetworkPermissionGuide
        isVisible={showPermissionGuide}
        onDismiss={dismissPermissionGuide}
      />
    </View>
  );
};

export default App;
