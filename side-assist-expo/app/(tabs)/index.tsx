import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, StatusIndicator, Header } from '@/components/ui';

export default function SideAssistScreen() {
  const [isConnected, setIsConnected] = useState(false);

  const handleTestConnection = () => {
    setIsConnected(!isConnected);
  };

  return (
    <View className="flex-1 bg-white">
      <Header 
        title="Side Assist Plus"
        showSettings={true}
        onSettingsPress={() => console.log('Settings pressed')}
        showShadow={true}
      />
      
      <View className="px-5 pb-5">
        <StatusIndicator isConnected={isConnected} />
      </View>

      <View className="flex-1 justify-center items-center px-5">
        <View className="items-center mb-8">
          <View className="mb-4">
            <MaterialIcons name="smartphone" size={64} color="#6b7280" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Side Assist Plus
          </Text>
          <Text className="text-base text-gray-600 text-center mt-2 leading-6">
            Expo Router v5 移植テスト{'\n'}TailwindCSS + Vector Icons
          </Text>
        </View>

        <View className="w-full space-y-4">
          <Button
            title={isConnected ? "Disconnect Test" : "Connect Test"}
            icon={
              <MaterialIcons 
                name={isConnected ? "link-off" : "link"} 
                size={18} 
                color="#ffffff" 
              />
            }
            variant="primary"
            onPress={handleTestConnection}
          />
        </View>
      </View>
    </View>
  );
}
