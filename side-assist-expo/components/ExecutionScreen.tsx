import React, { useState } from 'react';
import { View, Animated } from 'react-native';
import { Header, StatusIndicator, ActionButton } from './ui';
import { MaterialIcons } from '@expo/vector-icons';
import AlertManager from '../utils/AlertManager';

interface ExecutionScreenProps {
  onSettingsPress: () => void;
  onSendText: (text: string) => Promise<void>;
}

export const ExecutionScreen: React.FC<ExecutionScreenProps> = ({
  onSettingsPress,
  onSendText,
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
      icon: <MaterialIcons name="psychology" size={32} color="#000000" />,
      text: 'ultradeepthink',
    },
    {
      id: 'action2',
      icon: <MaterialIcons name="flash-on" size={32} color="#000000" />,
      text: 'action2',
    },
    {
      id: 'action3',
      icon: <MaterialIcons name="gps-fixed" size={32} color="#000000" />,
      text: 'action3',
    },
    {
      id: 'action4',
      icon: <MaterialIcons name="rocket-launch" size={32} color="#000000" />,
      text: 'action4',
    },
    {
      id: 'action5',
      icon: <MaterialIcons name="build" size={32} color="#000000" />,
      text: 'action5',
    },
    {
      id: 'action6',
      icon: <MaterialIcons name="bar-chart" size={32} color="#000000" />,
      text: 'action6',
    },
  ];

  const handleActionPress = async (action: (typeof actions)[0]) => {
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
      console.log(`🚀 Sending text: "${action.text}"`);
      await onSendText(action.text);
    } catch (error) {
      console.error('Action press error:', error);
      AlertManager.showAlert(
        'エラー',
        'テキストの送信中にエラーが発生しました',
      );
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* ヘッダー */}
      <Header
        title="Side Assist Plus"
        showSettings={true}
        onSettingsPress={onSettingsPress}
        showShadow={true}
      />

      {/* ステータス表示 */}
      <View className="px-5 pb-5">
        <StatusIndicator isConnected={true} />
      </View>

      {/* メインコンテンツ - アクションボタングリッド */}
      <View className="flex-1 px-5 pb-10">
        <View className="flex-1 justify-center">
          {/* 2x3 グリッド */}
          <View className="flex-row justify-between">
            {/* 左列 */}
            <View className="flex-1 items-center">
              <View className="space-y-6">
                <ActionButton
                  icon={actions[0].icon}
                  onPress={() => handleActionPress(actions[0])}
                  animatedValue={buttonScales.ultradeepthink}
                />
                <ActionButton
                  icon={actions[3].icon}
                  onPress={() => handleActionPress(actions[3])}
                  animatedValue={buttonScales.action4}
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
                />
                <ActionButton
                  icon={actions[4].icon}
                  onPress={() => handleActionPress(actions[4])}
                  animatedValue={buttonScales.action5}
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
                />
                <ActionButton
                  icon={actions[5].icon}
                  onPress={() => handleActionPress(actions[5])}
                  animatedValue={buttonScales.action6}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};