import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { settingsStyles } from '../styles/settingsStyles';
import { statusStyles } from '../styles/commonStyles';

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
    <View style={settingsStyles.settingsPanel}>
      <TouchableOpacity style={settingsStyles.closeButton} onPress={onClose}>
        <Text style={settingsStyles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <Text style={settingsStyles.settingsTitle}>接続情報</Text>

      <View style={settingsStyles.settingsRow}>
        <Text style={settingsStyles.settingsLabel}>接続状態</Text>
        <Text
          style={[
            settingsStyles.settingsValue,
            isConnected
              ? statusStyles.statusConnected
              : statusStyles.statusDisconnected,
          ]}
        >
          {isConnected ? '接続済み' : '未接続'}
        </Text>
      </View>

      {macIP && (
        <View style={settingsStyles.settingsRow}>
          <Text style={settingsStyles.settingsLabel}>PC IP</Text>
          <Text style={settingsStyles.settingsValue}>{macIP}</Text>
        </View>
      )}

      <View style={settingsStyles.infoSection}>
        <Text style={settingsStyles.infoTitle}>📱 QRコード接続について</Text>
        <Text style={settingsStyles.infoText}>
          • PCで「新しいパスワード & QRコードを生成」をクリック
        </Text>
        <Text style={settingsStyles.infoText}>
          • 「📷 QRコードをスキャン」ボタンでカメラアプリを起動
        </Text>
        <Text style={settingsStyles.infoText}>
          • QRコードを読み取ると自動的にアプリに戻って接続完了
        </Text>
      </View>

      <View style={settingsStyles.infoSection}>
        <Text style={settingsStyles.infoTitle}>⌨️ 手動接続について</Text>
        <Text style={settingsStyles.infoText}>
          QRコードが使えない場合は「手動で入力」から接続できます
        </Text>
      </View>

      {onShowPermissionGuide && (
        <View style={settingsStyles.infoSection}>
          <Text style={settingsStyles.infoTitle}>
            🔧 接続のトラブルシューティング
          </Text>
          <Text style={settingsStyles.infoText}>
            手動入力でも接続できない場合：
          </Text>
          <TouchableOpacity
            style={settingsStyles.permissionButton}
            onPress={onShowPermissionGuide}
          >
            <Text style={settingsStyles.permissionButtonText}>
              📶 ネットワーク権限を確認
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
