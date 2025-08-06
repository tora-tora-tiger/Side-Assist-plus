import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import AlertManager from '../utils/AlertManager';

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
    <View className="bg-gray-900 rounded-xl p-5 mx-5 mb-5 border border-gray-700">
      <Text className="text-white text-xl font-semibold mb-2 text-center">
        🔐 パスワード認証
      </Text>

      <Text className="text-gray-300 text-base mb-4 text-center">
        PCに表示されている5桁のパスワードを入力してください
      </Text>

      <View className="mb-4">
        <TextInput
          className="bg-gray-800 rounded-lg p-3 text-white text-2xl text-center border border-gray-600 font-mono"
          style={{ letterSpacing: 8 }}
          value={password}
          onChangeText={setPassword}
          placeholder="12345"
          keyboardType="numeric"
          maxLength={5}
          autoFocus={true}
          editable={!isAuthenticating}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity
        className={`rounded-lg p-3 items-center justify-center min-h-11 ${
          password.length === 5 && !isAuthenticating
            ? 'bg-primary'
            : 'bg-gray-400'
        }`}
        onPress={handleAuthenticate}
        disabled={password.length !== 5 || isAuthenticating}
      >
        <Text className="text-white text-base font-semibold">
          {isAuthenticating ? '認証中...' : '認証する'}
        </Text>
      </TouchableOpacity>

      <Text className="text-xs text-gray-600 text-center mt-2">
        パスワードは5分間有効です
      </Text>
    </View>
  );
};
