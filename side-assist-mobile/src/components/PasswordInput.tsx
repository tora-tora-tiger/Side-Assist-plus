import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import AlertManager from '../utils/AlertManager';
import CustomButton from './CustomButton';

interface PasswordInputProps {
  onAuthenticate: (password: string) => Promise<boolean>;
  isVisible: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  onAuthenticate,
  isVisible,
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    if (password.length !== 5) {
      AlertManager.showAlert('エラー', 'パスワードは5桁で入力してください');
      return;
    }

    try {
      setIsAuthenticating(true);
      const success = await onAuthenticate(password);

      if (!success) {
        AlertManager.showAlert(
          '認証失敗',
          'パスワードが正しくありません。PCで新しいパスワードを生成してください。',
        );
        setPassword('');
      }
    } catch (error) {
      AlertManager.showAlert('エラー', '認証中にエラーが発生しました');
      setPassword('');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View className="bg-white rounded-4xl p-6 mx-5 mb-5 shadow-lg">
      <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
        🔐 パスワード認証
      </Text>

      <Text className="text-base text-gray-600 text-center mb-4 leading-6">
        PCに表示されている5桁のパスワードを入力してください
      </Text>

      <View className="mb-4">
        <TextInput
          className="border border-gray-200 rounded-xl px-4 py-4 text-2xl text-center font-mono tracking-widest bg-white"
          value={password}
          onChangeText={setPassword}
          placeholder="12345"
          keyboardType="numeric"
          maxLength={5}
          autoFocus={true}
          editable={!isAuthenticating}
          placeholderTextColor="#999999"
        />
      </View>

      <CustomButton
        title="認証する"
        isActive={password.length === 5 && !isAuthenticating}
        isLoading={isAuthenticating}
        onPress={handleAuthenticate}
      />

      <Text className="text-xs text-gray-500 text-center mt-3">
        パスワードは5分間有効です
      </Text>
    </View>
  );
};
