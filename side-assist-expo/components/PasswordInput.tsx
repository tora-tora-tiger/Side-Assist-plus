import React, { useState } from "react";
import { View, Text } from "react-native";
import { Button, InputField } from "./ui";

interface PasswordInputProps {
  onAuthenticate: (password: string) => Promise<boolean>;
  isVisible: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  onAuthenticate,
  isVisible,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthenticate = async () => {
    if (!password) return;

    setIsLoading(true);
    try {
      await onAuthenticate(password);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 z-50 bg-black/50 justify-center items-center px-5">
      <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
        <Text className="text-xl font-bold text-center mb-4">
          パスワード入力
        </Text>
        <InputField
          label="5桁のパスワード"
          value={password}
          onChangeText={setPassword}
          keyboardType="numeric"
          maxLength={5}
          placeholder="12345"
        />
        <Button
          title="認証"
          onPress={handleAuthenticate}
          disabled={password.length !== 5}
          loading={isLoading}
        />
      </View>
    </View>
  );
};
