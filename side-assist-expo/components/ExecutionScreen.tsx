import React, { useState } from 'react';
import { View, Animated, ScrollView } from 'react-native';
import { Header, StatusIndicator, ActionButton, Button } from './ui';
import { MaterialIcons } from '@expo/vector-icons';
import AlertManager from '../utils/AlertManager';

interface ExecutionScreenProps {
  onSettingsPress: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendCopy: () => Promise<boolean>;
  onSendPaste: () => Promise<boolean>;
  onExecuteCustomAction: (actionId: string) => Promise<boolean>;
  onStartRecording: (actionId: string, name: string, icon?: string) => Promise<boolean>;
  onStopRecording: (actionId: string) => Promise<boolean>;
  onDisconnect: () => void;
}

export const ExecutionScreen: React.FC<ExecutionScreenProps> = ({
  onSettingsPress,
  onSendText,
  onSendCopy,
  onSendPaste,
  onExecuteCustomAction,
  onStartRecording,
  onStopRecording,
  onDisconnect,
}) => {
  const [buttonScales] = useState(() => ({
    ultradeepthink: new Animated.Value(1),
    copy: new Animated.Value(1),
    paste: new Animated.Value(1),
    record: new Animated.Value(1),
    action5: new Animated.Value(1),
    action6: new Animated.Value(1),
  }));

  const [isRecording, setIsRecording] = useState(false);
  const [recordingActionId, setRecordingActionId] = useState<string | null>(null);

  // 6つのアクション定義
  const actions = [
    {
      id: 'ultradeepthink',
      icon: <MaterialIcons name="psychology" size={32} color="#ffffff" />,
      text: 'ultradeepthink',
      backgroundColor: '#6366f1', // Indigo
      type: 'text' as const,
    },
    {
      id: 'copy',
      icon: <MaterialIcons name="content-copy" size={32} color="#ffffff" />,
      text: 'copy',
      backgroundColor: '#f59e0b', // Amber
      type: 'clipboard' as const,
    },
    {
      id: 'paste',
      icon: <MaterialIcons name="content-paste" size={32} color="#ffffff" />,
      text: 'paste',
      backgroundColor: '#10b981', // Emerald
      type: 'clipboard' as const,
    },
    {
      id: 'record',
      icon: <MaterialIcons name={isRecording ? "stop" : "radio-button-checked"} size={32} color="#ffffff" />,
      text: isRecording ? 'stop recording' : 'record action',
      backgroundColor: isRecording ? '#ef4444' : '#f59e0b', // Red when recording, Amber when not
      type: 'record' as const,
    },
    {
      id: 'action5',
      icon: <MaterialIcons name="build" size={32} color="#ffffff" />,
      text: 'action5',
      backgroundColor: '#8b5cf6', // Violet
      type: 'text' as const,
    },
    {
      id: 'action6',
      icon: <MaterialIcons name="bar-chart" size={32} color="#ffffff" />,
      text: 'action6',
      backgroundColor: '#06b6d4', // Cyan
      type: 'text' as const,
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
      if (action.type === 'clipboard') {
        if (action.id === 'copy') {
          console.log(`📋 [ExecutionScreen] Executing copy command`);
          const success = await onSendCopy();
          if (success) {
            console.log(`✅ [ExecutionScreen] Copy command executed successfully`);
          } else {
            throw new Error('Copy command failed');
          }
        } else if (action.id === 'paste') {
          console.log(`📋 [ExecutionScreen] Executing paste command`);
          const success = await onSendPaste();
          if (success) {
            console.log(`✅ [ExecutionScreen] Paste command executed successfully`);
          } else {
            throw new Error('Paste command failed');
          }
        }
      } else if (action.type === 'record') {
        if (isRecording) {
          // Stop recording
          console.log(`⏹️ [ExecutionScreen] Stopping recording for action: ${recordingActionId}`);
          if (recordingActionId) {
            const success = await onStopRecording(recordingActionId);
            if (success) {
              setIsRecording(false);
              setRecordingActionId(null);
              console.log(`✅ [ExecutionScreen] Recording stopped successfully`);
            } else {
              throw new Error('Failed to stop recording');
            }
          }
        } else {
          // Start recording
          const actionId = `custom_${Date.now()}`;
          const actionName = `Custom Action ${Date.now()}`;
          console.log(`🔴 [ExecutionScreen] Starting recording for action: ${actionName} (${actionId})`);
          
          const success = await onStartRecording(actionId, actionName, 'build');
          if (success) {
            setIsRecording(true);
            setRecordingActionId(actionId);
            console.log(`✅ [ExecutionScreen] Recording started successfully`);
          } else {
            throw new Error('Failed to start recording');
          }
        }
      } else {
        console.log(`🚀 [ExecutionScreen] Sending text: "${action.text}"`);
        await onSendText(action.text);
        console.log(`✅ [ExecutionScreen] Text sent successfully: "${action.text}"`);
      }
    } catch (error) {
      console.error('🚨 [ExecutionScreen] Action press error:', error);
      let errorMessage = 'テキストの送信中にエラーが発生しました';
      if (action.type === 'clipboard') {
        errorMessage = `${action.text}コマンドの実行中にエラーが発生しました`;
      } else if (action.type === 'record') {
        errorMessage = isRecording ? '録画の停止中にエラーが発生しました' : '録画の開始中にエラーが発生しました';
      }
      AlertManager.showAlert('エラー', errorMessage);
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
                    animatedValue={buttonScales.record}
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
                    animatedValue={buttonScales.copy}
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
                    animatedValue={buttonScales.paste}
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