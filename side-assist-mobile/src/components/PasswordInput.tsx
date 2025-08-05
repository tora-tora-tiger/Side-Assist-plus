import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import AlertManager from '../utils/AlertManager';
import { commonStyles } from '../styles/commonStyles';

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
    <View style={[commonStyles.card, { marginBottom: 20 }]}>
      <Text
        style={[commonStyles.title, { marginBottom: 10, textAlign: 'center' }]}
      >
        🔐 パスワード認証
      </Text>

      <Text
        style={[
          commonStyles.subtitle,
          { marginBottom: 15, textAlign: 'center' },
        ]}
      >
        PCに表示されている5桁のパスワードを入力してください
      </Text>

      <View style={{ marginBottom: 15 }}>
        <TextInput
          style={[
            commonStyles.textInput,
            {
              fontSize: 24,
              textAlign: 'center',
              letterSpacing: 8,
              fontFamily: 'monospace',
            },
          ]}
          value={password}
          onChangeText={setPassword}
          placeholder="12345"
          keyboardType="numeric"
          maxLength={5}
          autoFocus={true}
          editable={!isAuthenticating}
        />
      </View>

      <TouchableOpacity
        style={[
          commonStyles.button,
          {
            backgroundColor:
              password.length === 5 && !isAuthenticating
                ? '#007AFF'
                : '#cccccc',
          },
        ]}
        onPress={handleAuthenticate}
        disabled={password.length !== 5 || isAuthenticating}
      >
        <Text style={[commonStyles.buttonText, { color: 'white' }]}>
          {isAuthenticating ? '認証中...' : '認証する'}
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 12,
          color: '#666',
          textAlign: 'center',
          marginTop: 10,
        }}
      >
        パスワードは5分間有効です
      </Text>
    </View>
  );
};
