import React, { useEffect, useState } from "react";
import {
  View,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { Header, StatusIndicator, ActionButton, Button } from "./ui";
import { MaterialIcons } from "@expo/vector-icons";
import AlertManager from "../utils/AlertManager";
import { CustomAction } from "../services/NetworkService";

interface ExecutionScreenProps {
  onSettingsPress: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendCopy: () => Promise<boolean>;
  onSendPaste: () => Promise<boolean>;
  onExecuteCustomAction: (actionId: string) => Promise<boolean>;
  onPrepareRecording: (
    actionId: string,
    name: string,
    icon?: string,
  ) => Promise<boolean>;
  resetRecordingState: () => void;
  customActions: CustomAction[];
  onDisconnect: () => void;
}

export const ExecutionScreen: React.FC<ExecutionScreenProps> = ({
  onSettingsPress,
  onSendText,
  onSendCopy,
  onSendPaste,
  onExecuteCustomAction,
  onPrepareRecording,
  customActions,
  onDisconnect,
}) => {
  // カスタムアクション状態をログ出力
  useEffect(() => {
    console.log(
      `🎭 [ExecutionScreen] Custom actions updated: ${customActions.length} actions`,
    );
    customActions.forEach((action, index) => {
      console.log(
        `  ${index + 1}. ${action.name} (id: ${action.id}, keys: ${action.key_sequence.length})`,
      );
    });
  }, [customActions]);

  const [buttonScales] = useState(() => ({
    ultradeepthink: new Animated.Value(1),
    copy: new Animated.Value(1),
    paste: new Animated.Value(1),
    action4: new Animated.Value(1),
    action5: new Animated.Value(1),
    action6: new Animated.Value(1),
    recordButton: new Animated.Value(1),
  }));

  const [isRecordingPrepared, setIsRecordingPrepared] = useState(false);
  const [recordingActionId, setRecordingActionId] = useState<string | null>(
    null,
  );
  // recordingActionIdを実際に使用
  console.log("Current recording action ID:", recordingActionId);

  // 録画状態リセット関数の実装
  const handleResetRecordingState = React.useCallback(() => {
    console.log("🔄 [ExecutionScreen] Resetting recording state...");
    setIsRecordingPrepared(false);
    console.log("✅ [ExecutionScreen] Recording state reset completed");
  }, []);

  // グローバルなリセット関数を作成（useConnectionで呼び出される）
  useEffect(() => {
    // グローバルなwindowオブジェクトに関数を追加
    (
      window as { resetExecutionScreenRecordingState?: () => void }
    ).resetExecutionScreenRecordingState = handleResetRecordingState;

    return () => {
      // クリーンアップ
      delete (window as { resetExecutionScreenRecordingState?: () => void })
        .resetExecutionScreenRecordingState;
    };
  }, [handleResetRecordingState]);

  // 6つのアクション定義
  const actions = [
    {
      id: "ultradeepthink",
      icon: <MaterialIcons name="psychology" size={32} color="#ffffff" />,
      text: "ultradeepthink",
      backgroundColor: "#6366f1", // Indigo
      type: "text" as const,
    },
    {
      id: "copy",
      icon: <MaterialIcons name="content-copy" size={32} color="#ffffff" />,
      text: "copy",
      backgroundColor: "#f59e0b", // Amber
      type: "clipboard" as const,
    },
    {
      id: "paste",
      icon: <MaterialIcons name="content-paste" size={32} color="#ffffff" />,
      text: "paste",
      backgroundColor: "#10b981", // Emerald
      type: "clipboard" as const,
    },
    {
      id: "action4",
      icon: <MaterialIcons name="rocket-launch" size={32} color="#ffffff" />,
      text: "action4",
      backgroundColor: "#ef4444", // Red
      type: "text" as const,
    },
    {
      id: "action5",
      icon: <MaterialIcons name="build" size={32} color="#ffffff" />,
      text: "action5",
      backgroundColor: "#8b5cf6", // Violet
      type: "text" as const,
    },
    {
      id: "action6",
      icon: <MaterialIcons name="bar-chart" size={32} color="#ffffff" />,
      text: "action6",
      backgroundColor: "#06b6d4", // Cyan
      type: "text" as const,
    },
  ];

  const handleActionPress = async (action: (typeof actions)[0]) => {
    console.log(
      `🔥 [ExecutionScreen] Button pressed: ${action.id} - "${action.text}"`,
    );

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
      if (action.type === "clipboard") {
        if (action.id === "copy") {
          console.log(`📋 [ExecutionScreen] Executing copy command`);
          const success = await onSendCopy();
          if (success) {
            console.log(
              `✅ [ExecutionScreen] Copy command executed successfully`,
            );
          } else {
            throw new Error("Copy command failed");
          }
        } else if (action.id === "paste") {
          console.log(`📋 [ExecutionScreen] Executing paste command`);
          const success = await onSendPaste();
          if (success) {
            console.log(
              `✅ [ExecutionScreen] Paste command executed successfully`,
            );
          } else {
            throw new Error("Paste command failed");
          }
        }
      } else {
        console.log(`🚀 [ExecutionScreen] Sending text: "${action.text}"`);
        await onSendText(action.text);
        console.log(
          `✅ [ExecutionScreen] Text sent successfully: "${action.text}"`,
        );
      }
    } catch (error) {
      console.error("🚨 [ExecutionScreen] Action press error:", error);
      let errorMessage = "テキストの送信中にエラーが発生しました";
      if (action.type === "clipboard") {
        errorMessage = `${action.text}コマンドの実行中にエラーが発生しました`;
      }
      AlertManager.showAlert("エラー", errorMessage);
    }
  };

  // カスタムアクション実行処理
  const handleCustomAction = async (action: CustomAction) => {
    console.log(
      `🎭 [ExecutionScreen] Executing custom action: ${action.name} (${action.id})`,
    );

    try {
      const success = await onExecuteCustomAction(action.id);
      if (success) {
        console.log(
          `✅ [ExecutionScreen] Custom action executed successfully: ${action.name}`,
        );
        AlertManager.showAlert(
          "実行完了",
          `カスタムアクション「${action.name}」を実行しました。`,
        );
      } else {
        throw new Error("Custom action execution failed");
      }
    } catch (error) {
      console.error(
        "🚨 [ExecutionScreen] Custom action execution error:",
        error,
      );
      AlertManager.showAlert(
        "エラー",
        `カスタムアクション「${action.name}」の実行中にエラーが発生しました。`,
      );
    }
  };

  const handleDisconnect = () => {
    AlertManager.showAlert(
      "接続解除の確認",
      "PCとの接続を解除しますか？実行中の操作は中断されます。",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "解除",
          style: "destructive",
          onPress: () => {
            console.log("🔌 [ExecutionScreen] User confirmed disconnect");
            onDisconnect();
          },
        },
      ],
    );
  };

  // 録画準備処理
  const handlePrepareRecording = async () => {
    console.log("🎥 [ExecutionScreen] Preparing recording...");

    // シンプルなアニメーション
    const scale = buttonScales.recordButton;
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
      const actionId = `custom_${Date.now()}`;
      const actionName = `Custom Action ${new Date().toLocaleTimeString()}`;

      console.log(
        `📝 [ExecutionScreen] Preparing recording: ${actionName} (${actionId})`,
      );

      const success = await onPrepareRecording(actionId, actionName, "build");
      if (success) {
        setIsRecordingPrepared(true);
        setRecordingActionId(actionId);
        console.log("✅ [ExecutionScreen] Recording prepared successfully");
        AlertManager.showAlert(
          "録画準備完了",
          `デスクトップで「${actionName}」の録画を開始できます。`,
        );
      } else {
        throw new Error("Failed to prepare recording");
      }
    } catch (error) {
      console.error("🚨 [ExecutionScreen] Recording preparation error:", error);
      AlertManager.showAlert("エラー", "録画準備中にエラーが発生しました");
    }
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
        contentContainerClassName="flex-grow"
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

        {/* 録画セクション */}
        <View className="px-6 py-4">
          <View className="bg-white rounded-3xl p-6 shadow-soft mb-4">
            <View className="items-center">
              <Text className="text-lg font-bold text-neutral-900 mb-2">
                カスタムアクション録画
              </Text>
              <Text className="text-sm text-neutral-500 mb-4 text-center">
                デスクトップでキーボード操作を録画し、
                {"\n"}カスタムアクションとして保存できます
              </Text>

              <Animated.View
                style={{ transform: [{ scale: buttonScales.recordButton }] }}
                className="mb-2"
              >
                <TouchableOpacity
                  className={`w-20 h-20 rounded-full items-center justify-center ${
                    isRecordingPrepared ? "bg-green-500" : "bg-red-500"
                  } shadow-lg`}
                  onPress={handlePrepareRecording}
                  activeOpacity={0.8}
                  disabled={isRecordingPrepared}
                >
                  <MaterialIcons
                    name={
                      isRecordingPrepared
                        ? "check-circle"
                        : "radio-button-checked"
                    }
                    size={40}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </Animated.View>

              <Text
                className={`text-sm font-medium ${
                  isRecordingPrepared ? "text-green-600" : "text-neutral-700"
                }`}
              >
                {isRecordingPrepared ? "録画準備完了" : "録画を準備する"}
              </Text>

              {isRecordingPrepared && (
                <Text className="text-xs text-green-500 mt-1 text-center">
                  デスクトップで録画を開始してください
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 保存済みカスタムアクションセクション */}
        {customActions.length > 0 && (
          <View className="px-6 py-4">
            <View className="bg-white rounded-3xl p-6 shadow-soft mb-4">
              <View className="mb-4">
                <Text className="text-lg font-bold text-neutral-900 mb-2">
                  保存済みカスタムアクション
                </Text>
                <Text className="text-sm text-neutral-500 mb-4">
                  録画済みのキーシーケンスを実行できます ({customActions.length}
                  個)
                </Text>
              </View>

              {/* カスタムアクション一覧 */}
              <View className="space-y-3">
                {customActions.map(action => (
                  <TouchableOpacity
                    key={action.id}
                    className="bg-neutral-50 rounded-xl p-4 flex-row items-center justify-between border border-neutral-200"
                    onPress={() => handleCustomAction(action)}
                    activeOpacity={0.8}
                  >
                    <View className="flex-1 flex-row items-center">
                      <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                        <MaterialIcons
                          name={
                            (action.icon as keyof typeof MaterialIcons.glyphMap) ||
                            "build"
                          }
                          size={18}
                          color="#ffffff"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-neutral-900 mb-1">
                          {action.name}
                        </Text>
                        <Text className="text-xs text-neutral-500">
                          {action.key_sequence.length}個のキー・
                          {new Date(
                            action.created_at * 1000,
                          ).toLocaleDateString()}
                          作成
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name="play-arrow"
                      size={24}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

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
