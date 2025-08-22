import React from "react";
import { View, ScrollView, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "./ui";
import { ActionGrid } from "./ActionGrid";
import { RecordingSection } from "./RecordingSection";
import { CustomActionList } from "./CustomActionList";
import { CustomAction } from "../services/NetworkService";
import { ActionType } from "../constants/actions";

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
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* メインコンテンツ - アクションボタングリッド */}
      <ActionGrid onActionPress={onActionPress} buttonScales={buttonScales} />

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
    </ScrollView>
  );
};
