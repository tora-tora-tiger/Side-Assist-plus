import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Header, Button, InputField } from "./ui";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [ip, setIP] = useState("");
  const [port, setPort] = useState("8080");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!ip.trim()) {
      newErrors.ip = "IPアドレスを入力してください";
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim())) {
      newErrors.ip = "正しいIPアドレスの形式で入力してください";
    }

    if (!port.trim()) {
      newErrors.port = "ポート番号を入力してください";
    } else if (
      isNaN(Number(port)) ||
      Number(port) < 1 ||
      Number(port) > 65535
    ) {
      newErrors.port = "1-65535の範囲で入力してください";
    }

    if (!password.trim()) {
      newErrors.password = "パスワードを入力してください";
    } else if (password.length !== 5) {
      newErrors.password = "5桁の数字を入力してください";
    } else if (!/^\d{5}$/.test(password)) {
      newErrors.password = "数字のみで入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const success = await onConnect(ip.trim(), port.trim(), password.trim());
      if (success) {
        onClose();
      } else {
        setErrors({ general: "接続に失敗しました。設定を確認してください。" });
      }
    } catch (error) {
      console.error("Connection error:", error);
      setErrors({ general: "接続中にエラーが発生しました。" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <View className="flex-1 bg-neutral-50">
      <Header
        title="手動接続"
        subtitle="PC接続情報を入力"
        showClose={true}
        onClosePress={onClose}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 py-6">
            {/* Instruction Card */}
            <View className="bg-white rounded-3xl p-6 mb-6 shadow-soft">
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-primary-100 rounded-2xl items-center justify-center mr-4">
                  <MaterialIcons
                    name="info-outline"
                    size={24}
                    color="#0ea5e9"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-neutral-900 mb-2">
                    接続情報の入力
                  </Text>
                  <Text className="text-neutral-600 leading-relaxed">
                    PCで表示される接続情報を正確に入力してください。IPアドレス、ポート番号、パスワードが必要です。
                  </Text>
                </View>
              </View>
            </View>

            {/* Form Card */}
            <View className="bg-white rounded-3xl p-6 shadow-soft">
              {/* General Error */}
              {errors.general && (
                <View className="bg-danger-50 border border-danger-200 rounded-2xl p-4 mb-6">
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="error-outline"
                      size={20}
                      color="#dc2626"
                    />
                    <Text className="text-danger-600 font-medium ml-2 flex-1">
                      {errors.general}
                    </Text>
                  </View>
                </View>
              )}

              {/* Form Fields */}
              <View className="space-y-4">
                <InputField
                  label="IPアドレス"
                  value={ip}
                  onChangeText={setIP}
                  placeholder="例: 192.168.1.100"
                  keyboardType="numeric"
                  required={true}
                  error={errors.ip}
                  hint="PCのローカルIPアドレスを入力"
                />

                <InputField
                  label="ポート番号"
                  value={port}
                  onChangeText={setPort}
                  placeholder="8080"
                  keyboardType="numeric"
                  required={true}
                  error={errors.port}
                  hint="通常は8080です"
                />

                <InputField
                  label="パスワード"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="12345"
                  keyboardType="numeric"
                  maxLength={5}
                  secureTextEntry={true}
                  required={true}
                  error={errors.password}
                  hint="PCで表示される5桁のパスワード"
                />
              </View>

              {/* Connect Button */}
              <View className="mt-8">
                <Button
                  title="接続"
                  icon={<MaterialIcons name="link" size={20} />}
                  variant="primary"
                  size="lg"
                  onPress={handleConnect}
                  disabled={!ip || !port || password.length !== 5}
                  loading={isLoading}
                />
              </View>
            </View>

            {/* Help Card */}
            <View className="bg-white rounded-3xl p-6 mt-6 shadow-soft">
              <View className="flex-row items-start">
                <View className="w-10 h-10 bg-warning-100 rounded-2xl items-center justify-center mr-4 mt-1">
                  <MaterialIcons
                    name="help-outline"
                    size={20}
                    color="#ca8a04"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-neutral-900 mb-2">
                    接続のトラブルシューティング
                  </Text>
                  <View className="space-y-2">
                    <Text className="text-neutral-600 text-sm leading-relaxed">
                      • PCとスマートフォンが同じWi-Fiに接続されているか確認
                    </Text>
                    <Text className="text-neutral-600 text-sm leading-relaxed">
                      • PCのファイアウォール設定を確認
                    </Text>
                    <Text className="text-neutral-600 text-sm leading-relaxed">
                      • PCアプリが正常に起動しているか確認
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
