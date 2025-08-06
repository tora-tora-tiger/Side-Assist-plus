import React from 'react';
import { View, Text, Modal, ScrollView } from 'react-native';
import { Header, Button } from './ui';

interface NetworkPermissionGuideProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const NetworkPermissionGuide: React.FC<NetworkPermissionGuideProps> = ({
  isVisible,
  onDismiss,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <Header
          title="ネットワーク権限設定"
          showClose={true}
          onClosePress={onDismiss}
          showShadow={true}
        />
        
        <ScrollView className="flex-1 p-5">
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-4">
              ネットワーク権限の設定方法
            </Text>
            
            <Text className="text-base leading-6 mb-4">
              1. iPhone設定アプリを開く{'\n'}
              2. プライバシーとセキュリティ → ローカルネットワーク{'\n'}
              3. Side Assist Plus をオンにする{'\n'}
              4. アプリに戻る
            </Text>
            
            <Text className="text-sm text-gray-600 mb-4">
              この権限により、同じWi-Fiネットワーク内のPCとの通信が可能になります。
            </Text>
          </View>
          
          <Button
            title="閉じる"
            onPress={onDismiss}
            variant="primary"
          />
        </ScrollView>
      </View>
    </Modal>
  );
};