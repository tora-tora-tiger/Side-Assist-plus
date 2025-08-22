import React from "react";
import { Animated, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Draggable, Droppable } from "@mgcrea/react-native-dnd";
import { ActionButton } from "./ui";
import { ActionType } from "../constants/actions";

interface DraggableActionButtonProps {
  action: ActionType;
  index: number;
  isEditMode: boolean;
  animatedValue: Animated.Value;
  onPress: (action: ActionType) => Promise<void>;
}

export const DraggableActionButton: React.FC<DraggableActionButtonProps> = ({
  action,
  index: _index,
  isEditMode,
  animatedValue,
  onPress,
}) => {
  // 編集モードでない場合は通常のActionButtonを表示
  if (!isEditMode) {
    return (
      <ActionButton
        icon={
          <MaterialIcons name={action.iconName} size={32} color="#ffffff" />
        }
        onPress={() => onPress(action)}
        animatedValue={animatedValue}
        backgroundColor={action.backgroundColor}
      />
    );
  }

  // 編集モードの場合はDraggableでラップ
  return (
    <Droppable id={`drop-${action.id}`} disabled={!isEditMode}>
      <View className="relative">
        <Draggable id={action.id} disabled={!isEditMode}>
          <View className="relative">
            {/* 編集モード時の視覚的インジケーター */}
            <View className="absolute -top-1 -right-1 z-10">
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center shadow-md">
                <MaterialIcons name="drag-handle" size={12} color="#ffffff" />
              </View>
            </View>

            {/* ActionButton */}
            <ActionButton
              icon={
                <MaterialIcons
                  name={action.iconName}
                  size={32}
                  color="#ffffff"
                />
              }
              onPress={() => {
                // 編集モード時はアクション実行を無効化
                if (!isEditMode) {
                  onPress(action);
                }
              }}
              animatedValue={animatedValue}
              backgroundColor={action.backgroundColor}
              style={{
                // 編集モード時のスタイル調整
                opacity: isEditMode ? 0.9 : 1,
                borderWidth: isEditMode ? 2 : 0,
                borderColor: isEditMode ? "#3b82f6" : "transparent",
              }}
            />
          </View>
        </Draggable>
      </View>
    </Droppable>
  );
};
