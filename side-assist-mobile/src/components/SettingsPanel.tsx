import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SettingsPanelProps {
  isVisible: boolean;
  isConnected: boolean;
  macIP: string;
  onClose: () => void;
  onShowPermissionGuide?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isVisible,
  isConnected,
  macIP,
  onClose,
  onShowPermissionGuide,
}) => {
  if (!isVisible) return null;

  return (
    <View className="absolute inset-0 bg-black/95 p-5 pt-30 z-20">
      <TouchableOpacity
        className="absolute top-15 right-5 w-10 h-10 bg-white/10 rounded-full justify-center items-center"
        onPress={onClose}
      >
        <Text className="text-white text-lg font-bold">✕</Text>
      </TouchableOpacity>

      <Text className="text-white text-2xl font-bold mb-8 text-center">
        接続情報
      </Text>

      <View className="flex-row justify-between items-center py-4 border-b border-gray-700">
        <Text className="text-gray-300 text-base">接続状態</Text>
        <Text
          className={`text-base font-medium ${
            isConnected ? 'text-success' : 'text-error'
          }`}
        >
          {isConnected ? '接続済み' : '未接続'}
        </Text>
      </View>

      {macIP && (
        <View className="flex-row justify-between items-center py-4 border-b border-gray-700">
          <Text className="text-gray-300 text-base">PC IP</Text>
          <Text className="text-white text-base font-medium">{macIP}</Text>
        </View>
      )}

      <View className="mt-8 p-4 bg-white/5 rounded-lg border border-gray-700">
        <Text className="text-white text-base font-semibold mb-3">
          📱 QRコード接続について
        </Text>
        <Text className="text-gray-300 text-sm leading-5 mb-1">
          • PCで「新しいパスワード & QRコードを生成」をクリック
        </Text>
        <Text className="text-gray-300 text-sm leading-5 mb-1">
          • 「📷 QRコードをスキャン」ボタンでカメラアプリを起動
        </Text>
        <Text className="text-gray-300 text-sm leading-5 mb-1">
          • QRコードを読み取ると自動的にアプリに戻って接続完了
        </Text>
      </View>

      <View className="mt-8 p-4 bg-white/5 rounded-lg border border-gray-700">
        <Text className="text-white text-base font-semibold mb-3">
          ⌨️ 手動接続について
        </Text>
        <Text className="text-gray-300 text-sm leading-5">
          QRコードが使えない場合は「手動で入力」から接続できます
        </Text>
      </View>

      {onShowPermissionGuide && (
        <View className="mt-8 p-4 bg-white/5 rounded-lg border border-gray-700">
          <Text className="text-white text-base font-semibold mb-3">
            🔧 接続のトラブルシューティング
          </Text>
          <Text className="text-gray-300 text-sm leading-5 mb-3">
            手動入力でも接続できない場合：
          </Text>
          <TouchableOpacity
            className="bg-orange-500 py-2 px-4 rounded-lg self-center mt-3"
            onPress={onShowPermissionGuide}
          >
            <Text className="text-white text-sm font-semibold text-center">
              📶 ネットワーク権限を確認
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
