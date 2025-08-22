import React from "react";
import { View, Text, Linking, Switch } from "react-native";
import { Header, Button } from "./ui";
import { getDeviceConfig } from "../utils/DeviceConfig";
import { useSettings } from "../contexts/SettingsContext";
import AlertManager from "../utils/AlertManager";

interface SettingsPanelProps {
  isVisible: boolean;
  isConnected: boolean;
  macIP: string;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  isConnected,
  macIP,
  onClose,
}) => {
  const deviceConfig = getDeviceConfig();
  const { settings, isLoading, updateSetting } = useSettings();

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      AlertManager.showAlert("エラー", "設定アプリを開けませんでした");
    }
  };
  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 z-40 bg-white">
      <Header title="設定" showClose={true} onClosePress={onClose} />

      <View className="flex-1 p-5">
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">接続状態</Text>
          <Text className="text-gray-600">
            {isConnected ? `接続中: ${macIP}` : "未接続"}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">デバイス情報</Text>
          <Text className="text-gray-600 text-sm mb-1">
            デバイス名: {deviceConfig.deviceName}
          </Text>
          <Text className="text-gray-600 text-sm mb-1">
            デバッグモード: {deviceConfig.debugMode ? "ON" : "OFF"}
          </Text>
          <Text className="text-gray-600 text-sm">
            開発モード: {deviceConfig.developmentMode ? "ON" : "OFF"}
          </Text>
        </View>

        {/* ハプティクス設定 */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">ハプティクス設定</Text>
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-1">
              <Text className="text-base text-gray-800">
                振動フィードバック
              </Text>
              <Text className="text-sm text-gray-600">
                ジェスチャー操作時の触覚フィードバック
              </Text>
            </View>
            <Switch
              value={settings?.hapticsEnabled ?? true}
              onValueChange={async value => {
                console.log(`🎯 [SettingsPanel] Toggling haptics: ${value}`);
                console.log(
                  `🎯 [SettingsPanel] Current settings before update:`,
                  settings,
                );
                const success = await updateSetting("hapticsEnabled", value);
                if (success) {
                  console.log(
                    `✅ [SettingsPanel] Haptics setting updated successfully to: ${value}`,
                  );
                } else {
                  console.log(
                    `❌ [SettingsPanel] Failed to update haptics setting`,
                  );
                  AlertManager.showAlert(
                    "エラー",
                    "ハプティクス設定の更新に失敗しました",
                  );
                }
              }}
              disabled={isLoading || !isConnected}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings?.hapticsEnabled ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
          {!isConnected && (
            <Text className="text-xs text-gray-400 mt-1">
              PCに接続すると設定を変更できます
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">
            ネットワーク権限設定
          </Text>
          <Text className="text-sm text-gray-700 mb-3 leading-5">
            PCとの接続に問題がある場合、ローカルネットワーク権限を確認してください。
          </Text>
          <Text className="text-sm text-gray-600 mb-4 leading-5">
            設定 → プライバシーとセキュリティ → ローカルネットワーク → Side
            Assist Plus をオン
          </Text>
          <Button
            title="設定アプリを開く"
            onPress={handleOpenSettings}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
};
