import React, { useState } from "react";
import { View, ScrollView, Animated, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "./ui";
import { FreeformActionGrid } from "./FreeformActionGrid";
import { RecordingSection } from "./RecordingSection";
import { CustomActionList } from "./CustomActionList";
import { CustomAction } from "../services/NetworkService";
import { ActionType } from "../constants/actions";

interface ActionsTabProps {
  onActionPress: (action: ActionType) => Promise<void>;
  onCustomActionPress: (action: CustomAction) => Promise<void>;
  onPrepareRecording: (shortcutType: "normal" | "sequential") => Promise<void>;
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

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
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
        </View>

        {isEditMode && (
          <View className="mt-2 p-3 bg-blue-50 rounded-lg">
            <Text className="text-blue-700 text-sm text-center">
              📱 アクションボタンをドラッグして自由に配置できます
            </Text>
            <Text className="text-blue-600 text-xs text-center mt-1">
              配置をリセットするには設定画面を確認してください
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
