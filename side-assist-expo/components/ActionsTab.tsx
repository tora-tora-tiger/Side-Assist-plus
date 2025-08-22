import React, { useState } from "react";
import { View, ScrollView, Animated, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "./ui";
import { FreeformActionGrid } from "./FreeformActionGrid";
import { RecordingSection } from "./RecordingSection";
import { CustomActionList } from "./CustomActionList";
import { CustomAction } from "../services/NetworkService";
import { ActionType } from "../constants/actions";
import { useActionPositions } from "../hooks/useActionPositions";

interface ActionsTabProps {
  onActionPress: (action: ActionType) => Promise<void>;
  onCustomActionPress: (action: CustomAction) => Promise<void>;
  onPrepareRecording: () => Promise<void>;
  onDisconnect: () => void;
  customActions: CustomAction[];
  isRecordingPrepared: boolean;
  buttonScales: Record<string, Animated.Value>;
}

export const ActionsTab: React.FC<ActionsTabProps> = ({
  onActionPress,
  onCustomActionPress,
  onPrepareRecording,
  onDisconnect,
  customActions,
  isRecordingPrepared,
  buttonScales,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const { resetToDefault: resetPositionsToDefault } = useActionPositions();

  const toggleEditMode = () => {
    console.log("🎯 [ActionsTab] Toggling edit mode:", !isEditMode);
    setIsEditMode(!isEditMode);
  };

  const handleResetLayout = async () => {
    console.log("🎯 [ActionsTab] Resetting layout to default");
    // For freeform mode, we need container dimensions
    // This will be handled by the FreeformActionGrid component
    await resetPositionsToDefault(300, 400); // Default container size
    setIsEditMode(false);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* 編集コントロール */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row justify-between items-center">
          <Button
            title={isEditMode ? "編集完了" : "レイアウト編集"}
            icon={
              <MaterialIcons name={isEditMode ? "check" : "edit"} size={20} />
            }
            variant={isEditMode ? "primary" : "primary"}
            size="sm"
            onPress={toggleEditMode}
          />

          {isEditMode && (
            <Button
              title="デフォルトに戻す"
              icon={<MaterialIcons name="refresh" size={16} />}
              variant="secondary"
              size="sm"
              onPress={handleResetLayout}
            />
          )}
        </View>

        {isEditMode && (
          <View className="mt-2 p-3 bg-blue-50 rounded-lg">
            <Text className="text-blue-700 text-sm text-center">
              📱 アクションボタンをドラッグして自由に配置できます
            </Text>
          </View>
        )}
      </View>

      {/* メインコンテンツ - 自由配置グリッド */}
      <FreeformActionGrid
        onActionPress={isEditMode ? async () => {} : onActionPress}
        buttonScales={buttonScales}
        isEditMode={isEditMode}
      />

      {/* 編集モード中は他の機能を隠す */}
      {!isEditMode && (
        <>
          {/* 録画セクション */}
          <RecordingSection
            isRecordingPrepared={isRecordingPrepared}
            onPrepareRecording={onPrepareRecording}
            buttonScales={{ recordButton: buttonScales.recordButton }}
          />

          {/* 保存済みカスタムアクションセクション */}
          <CustomActionList
            customActions={customActions}
            onCustomActionPress={onCustomActionPress}
          />

          {/* 接続解除ボタン */}
          <View className="px-6 pb-8">
            <Button
              title="接続を解除"
              icon={<MaterialIcons name="link-off" size={20} />}
              variant="danger"
              size="md"
              onPress={onDisconnect}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};
