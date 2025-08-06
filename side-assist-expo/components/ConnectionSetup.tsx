import React, { useState } from 'react';
import { View, Text, Modal } from 'react-native';
import { Header, Button, InputField } from './ui';

interface ConnectionSetupProps {
  onConnect: (ip: string, port: string, password: string) => Promise<boolean>;
  isVisible: boolean;
  onClose: () => void;
}

export const ConnectionSetup: React.FC<ConnectionSetupProps> = ({
  onConnect,
  isVisible,
  onClose,
}) => {
  const [ip, setIP] = useState('');
  const [port, setPort] = useState('8080');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (!ip || !port || !password) return;
    
    setIsLoading(true);
    try {
      const success = await onConnect(ip, port, password);
      if (success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <Header
          title="手動接続"
          showClose={true}
          onClosePress={onClose}
          showShadow={true}
        />
        
        <View className="flex-1 p-5">
          <Text className="text-base text-gray-600 mb-6">
            PCのIPアドレス、ポート番号、パスワードを入力してください
          </Text>
          
          <InputField
            label="IPアドレス"
            value={ip}
            onChangeText={setIP}
            placeholder="例: 192.168.1.100"
            keyboardType="numeric"
          />
          
          <InputField
            label="ポート番号"
            value={port}
            onChangeText={setPort}
            placeholder="8080"
            keyboardType="numeric"
          />
          
          <InputField
            label="パスワード"
            value={password}
            onChangeText={setPassword}
            placeholder="5桁の数字"
            keyboardType="numeric"
            maxLength={5}
          />
          
          <Button
            title="接続"
            onPress={handleConnect}
            disabled={!ip || !port || password.length !== 5}
            loading={isLoading}
          />
        </View>
      </View>
    </Modal>
  );
};