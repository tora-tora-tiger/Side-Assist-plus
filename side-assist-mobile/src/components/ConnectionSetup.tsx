import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Header, Button, InputField } from './ui';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import AlertManager from '../utils/AlertManager';

interface ConnectionSetupProps {
  onConnect: (ip: string, port: string, password: string) => Promise<boolean>;
  isVisible: boolean;
  onClose?: () => void;
}

export const ConnectionSetup: React.FC<ConnectionSetupProps> = ({
  onConnect,
  isVisible,
  onClose,
}) => {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('8080');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleManualConnect = async () => {
    if (!ip.trim() || !port.trim() || !password.trim()) {
      AlertManager.showAlert('入力エラー', 'すべての項目を入力してください');
      return;
    }

    if (password.length !== 5 || !/^\d{5}$/.test(password)) {
      AlertManager.showAlert(
        'パスワードエラー',
        'パスワードは5桁の数字で入力してください',
      );
      return;
    }

    try {
      setIsConnecting(true);
      const success = await onConnect(ip.trim(), port.trim(), password.trim());

      if (!success) {
        AlertManager.showAlert(
          '接続失敗',
          'PCに接続できませんでした。IPアドレス、ポート、パスワードを確認してください。',
        );
      } else {
        // Reset form on success
        setIp('');
        setPort('8080');
        setPassword('');
        if (onClose) onClose();
      }
    } catch (error) {
      AlertManager.showAlert('エラー', '接続中にエラーが発生しました');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      <Header
        title="Manual Connection"
        showClose={true}
        onClosePress={onClose}
        showShadow={true}
      />

      <View className="flex-1 p-6">
        <View className="items-center mb-8">
          <View className="mb-4">
            <MaterialIcons name="keyboard" size={64} color="#6b7280" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            手動接続
          </Text>
          <Text className="text-base text-gray-600 text-center mt-2 leading-6">
            PCの接続情報を入力してください
          </Text>
        </View>

        <View className="flex-1">
          {/* 手動入力フォーム */}
          <InputField
            label="IPアドレス"
            value={ip}
            onChangeText={setIp}
            placeholder="例: 192.168.1.100"
            keyboardType="numeric"
            autoCapitalize="none"
            editable={!isConnecting}
            required
          />

          <InputField
            label="ポート"
            value={port}
            onChangeText={setPort}
            placeholder="8080"
            keyboardType="numeric"
            editable={!isConnecting}
            required
          />

          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-800 mb-2">
              パスワード (5桁) <Text className="text-error">*</Text>
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-lg bg-white text-center font-mono"
              style={{ letterSpacing: 4 }}
              value={password}
              onChangeText={setPassword}
              placeholder="12345"
              keyboardType="numeric"
              maxLength={5}
              editable={!isConnecting}
              placeholderTextColor="#999999"
            />
          </View>

          <View className="mt-8">
            <Button
              title={isConnecting ? '接続中...' : '接続'}
              onPress={handleManualConnect}
              disabled={
                isConnecting ||
                !ip.trim() ||
                !port.trim() ||
                password.length !== 5
              }
              loading={isConnecting}
              variant="primary"
            />
          </View>
        </View>
      </View>
    </View>
  );
};
