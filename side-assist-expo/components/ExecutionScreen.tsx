import React, { useState } from 'react';
import { View, Animated, ScrollView } from 'react-native';
import { Header, StatusIndicator, ActionButton, Button } from './ui';
import { MaterialIcons } from '@expo/vector-icons';
import AlertManager from '../utils/AlertManager';

interface ExecutionScreenProps {
  onSettingsPress: () => void;
  onSendText: (text: string) => Promise<void>;
  onDisconnect: () => void;
}

export const ExecutionScreen: React.FC<ExecutionScreenProps> = ({
  onSettingsPress,
  onSendText,
  onDisconnect,
}) => {
  const [buttonScales] = useState(() => ({
    ultradeepthink: new Animated.Value(1),
    action2: new Animated.Value(1),
    action3: new Animated.Value(1),
    action4: new Animated.Value(1),
    action5: new Animated.Value(1),
    action6: new Animated.Value(1),
  }));

  // 6つのアクション定義
  const actions = [
    {
      id: 'ultradeepthink',
      icon: <MaterialIcons name="psychology" size={32} color="#ffffff" />,
      text: 'ultradeepthink',
      backgroundColor: '#6366f1', // Indigo
    },
    {
      id: 'action2',
      icon: <MaterialIcons name="flash-on" size={32} color="#ffffff" />,
      text: 'action2',
      backgroundColor: '#f59e0b', // Amber
    },
    {
      id: 'action3',
      icon: <MaterialIcons name="gps-fixed" size={32} color="#ffffff" />,
      text: 'action3',
      backgroundColor: '#10b981', // Emerald
    },
    {
      id: 'action4',
      icon: <MaterialIcons name="rocket-launch" size={32} color="#ffffff" />,
      text: 'action4',
      backgroundColor: '#ef4444', // Red
    },
    {
      id: 'action5',
      icon: <MaterialIcons name="build" size={32} color="#ffffff" />,
      text: 'action5',
      backgroundColor: '#8b5cf6', // Violet
    },
    {
      id: 'action6',
      icon: <MaterialIcons name="bar-chart" size={32} color="#ffffff" />,
      text: 'action6',
      backgroundColor: '#06b6d4', // Cyan
    },
  ];

  const handleActionPress = async (action: (typeof actions)[0]) => {
    console.log(`🔥 [ExecutionScreen] Button pressed: ${action.id} - "${action.text}"`);
    
    // シンプルなアニメーション
    const scale = buttonScales[action.id as keyof typeof buttonScales];
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      console.log(`🚀 [ExecutionScreen] Sending text: "${action.text}"`);
      await onSendText(action.text);
      console.log(`✅ [ExecutionScreen] Text sent successfully: "${action.text}"`);
    } catch (error) {
      console.error('🚨 [ExecutionScreen] Action press error:', error);
      AlertManager.showAlert(
        'エラー',
        'テキストの送信中にエラーが発生しました',
      );
    }
  };

  const handleDisconnect = () => {
    AlertManager.showAlert(
      '接続解除の確認',
      'PCとの接続を解除しますか？実行中の操作は中断されます。',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '解除',
          style: 'destructive',
          onPress: () => {
            console.log('🔌 [ExecutionScreen] User confirmed disconnect');
            onDisconnect();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* ヘッダー */}
      <Header
        title="Side Assist Plus"
        subtitle="PC Remote Control"
        showSettings={true}
        onSettingsPress={onSettingsPress}
      />

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ステータス表示 */}
        <View className="px-6 py-4">
          <StatusIndicator isConnected={true} variant="detailed" />
        </View>

        {/* メインコンテンツ - アクションボタングリッド */}
        <View className="flex-1 px-6 py-4">
          <View className="bg-white rounded-3xl p-6 shadow-soft">
            {/* 2x3 グリッド */}
            <View className="flex-row justify-between">
              {/* 左列 */}
              <View className="flex-1 items-center">
                <View className="space-y-6">
                  <ActionButton
                    icon={actions[0].icon}
                    onPress={() => handleActionPress(actions[0])}
                    animatedValue={buttonScales.ultradeepthink}
                    backgroundColor={actions[0].backgroundColor}
                  />
                  <ActionButton
                    icon={actions[3].icon}
                    onPress={() => handleActionPress(actions[3])}
                    animatedValue={buttonScales.action4}
                    backgroundColor={actions[3].backgroundColor}
                  />
                </View>
              </View>

              {/* 中央列 */}
              <View className="flex-1 items-center">
                <View className="space-y-6">
                  <ActionButton
                    icon={actions[1].icon}
                    onPress={() => handleActionPress(actions[1])}
                    animatedValue={buttonScales.action2}
                    backgroundColor={actions[1].backgroundColor}
                  />
                  <ActionButton
                    icon={actions[4].icon}
                    onPress={() => handleActionPress(actions[4])}
                    animatedValue={buttonScales.action5}
                    backgroundColor={actions[4].backgroundColor}
                  />
                </View>
              </View>

              {/* 右列 */}
              <View className="flex-1 items-center">
                <View className="space-y-6">
                  <ActionButton
                    icon={actions[2].icon}
                    onPress={() => handleActionPress(actions[2])}
                    animatedValue={buttonScales.action3}
                    backgroundColor={actions[2].backgroundColor}
                  />
                  <ActionButton
                    icon={actions[5].icon}
                    onPress={() => handleActionPress(actions[5])}
                    animatedValue={buttonScales.action6}
                    backgroundColor={actions[5].backgroundColor}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 接続解除ボタン */}
        <View className="px-6 pb-8">
          <Button
            title="接続を解除"
            icon={<MaterialIcons name="link-off" size={20} />}
            variant="danger"
            size="md"
            onPress={handleDisconnect}
          />
        </View>
      </ScrollView>
    </View>
  );
};