import React, { useEffect, useState } from "react";
import { View, Animated, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Header, StatusIndicator, TabNavigator } from "./ui";
import AlertManager from "../utils/AlertManager";
import { CustomAction } from "../services/NetworkService";
import { ActionType } from "../constants/actions";
import { ActionsTab } from "./ActionsTab";
import { GesturesTab } from "./GesturesTab";

interface ExecutionScreenProps {
  onSettingsPress: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendCopy: () => Promise<boolean>;
  onSendPaste: () => Promise<boolean>;
  onSendGesture?: (
    fingers: number,
    direction: string,
    action: string,
    actionData?: string,
  ) => Promise<boolean>;
  onExecuteCustomAction: (actionId: string) => Promise<boolean>;
  onPrepareRecording: (
    actionId: string,
    name: string,
    icon?: string,
    shortcutType?: "normal" | "sequential",
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
  onSendGesture,
  onExecuteCustomAction,
  onPrepareRecording,
  customActions,
  onDisconnect,
}) => {
  // タブ管理
  const [activeTab, setActiveTab] = useState("actions");

  // 全画面管理
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // タブ定義
  const tabs = [
    { id: "actions", title: "Actions", icon: "apps" as const },
    { id: "gestures", title: "Gestures", icon: "pan-tool" as const },
  ];

  // 全画面モード管理
  const handleFullscreenChange = (newIsFullscreen: boolean) => {
    console.log(
      "🎯 [ExecutionScreen] Fullscreen mode changed:",
      newIsFullscreen,
    );
    setIsFullscreen(newIsFullscreen);
  };

  // 録画状態リセット関数の実装
  const handleResetRecordingState = React.useCallback(() => {
    console.log("🔄 [ExecutionScreen] Resetting recording state...");
    setIsRecordingPrepared(false);
    console.log("✅ [ExecutionScreen] Recording state reset completed");
  }, []);

  // グローバルなリセット関数を作成（useConnectionで呼び出される）
  useEffect(() => {
    // React Native環境ではglobalオブジェクトを使用
    const globalObj = global as {
      resetExecutionScreenRecordingState?: () => void;
    };
    globalObj.resetExecutionScreenRecordingState = handleResetRecordingState;

    return () => {
      // クリーンアップ
      delete globalObj.resetExecutionScreenRecordingState;
    };
  }, [handleResetRecordingState]);

  const handleActionPress = async (action: ActionType) => {
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
  const handlePrepareRecording = async (
    shortcutType: "normal" | "sequential" = "normal",
  ) => {
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

      const success = await onPrepareRecording(
        actionId,
        actionName,
        "build",
        shortcutType,
      );
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

  // ジェスチャー検出ハンドラー
  const handleGestureDetected = async (gesture: {
    fingers: number;
    direction: string;
    action: string;
    mapping: { displayName: string; actionData?: string };
  }) => {
    console.log(`🤏 [ExecutionScreen] Gesture detected:`, gesture);

    if (!onSendGesture) {
      console.error("❌ [ExecutionScreen] onSendGesture not available");
      AlertManager.showAlert("エラー", "ジェスチャー機能が利用できません");
      return;
    }

    try {
      const success = await onSendGesture(
        gesture.fingers,
        gesture.direction,
        gesture.action,
        gesture.mapping.actionData,
      );

      if (success) {
        console.log(
          `✅ [ExecutionScreen] Gesture executed successfully: ${gesture.mapping.displayName}`,
        );
      } else {
        throw new Error("Gesture execution failed on server");
      }
    } catch (error) {
      console.error("🚨 [ExecutionScreen] Gesture execution error:", error);
      AlertManager.showAlert(
        "ジェスチャーエラー",
        `ジェスチャー実行中にエラーが発生しました: ${error}`,
      );
    }
  };

  return (
    <View className="flex-1 bg-neutral-50">
      {/* ヘッダー - 全画面時は非表示 */}
      {!isFullscreen && (
        <>
          <Header
            title="Side Assist Plus"
            subtitle="PC Remote Control"
            showSettings={true}
            onSettingsPress={onSettingsPress}
          />

          {/* ステータス表示 */}
          <View className="px-6 py-4">
            <StatusIndicator isConnected={true} variant="detailed" />
          </View>
        </>
      )}

      {/* フルスクリーンボタン - タブの上に配置 */}
      <View className={`px-6 ${isFullscreen ? "pt-12 pb-2" : "py-2"}`}>
        <View className="flex-row justify-end">
          <TouchableOpacity
            className={`flex-row items-center justify-center py-2 px-4 rounded-lg ${
              isFullscreen ? "bg-red-500" : "bg-blue-500"
            }`}
            onPress={() => handleFullscreenChange(!isFullscreen)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
              size={20}
              color="white"
            />
            <Text className="text-white font-semibold text-sm ml-2">
              {isFullscreen ? "終了" : "集中モード"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* タブナビゲーション - 全画面時は非表示 */}
      {!isFullscreen && (
        <TabNavigator
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* タブコンテンツ */}
      <View className="flex-1">
        {activeTab === "actions" ? (
          <ActionsTab
            onActionPress={handleActionPress}
            onCustomActionPress={handleCustomAction}
            onPrepareRecording={handlePrepareRecording}
            onDisconnect={handleDisconnect}
            customActions={customActions}
            isRecordingPrepared={isRecordingPrepared}
            buttonScales={buttonScales}
          />
        ) : (
          <GesturesTab onGestureDetected={handleGestureDetected} />
        )}
      </View>
    </View>
  );
};
