import React from "react";
import { View, Animated, StyleSheet } from "react-native";
import { DndProvider } from "@mgcrea/react-native-dnd";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DraggableActionButton } from "./DraggableActionButton";
import { ActionType } from "../constants/actions";
import { useActionOrder } from "../hooks/useActionOrder";

interface ActionGridProps {
  onActionPress: (action: ActionType) => Promise<void>;
  buttonScales: Record<string, Animated.Value>;
  isEditMode?: boolean;
}

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
});

export const ActionGrid: React.FC<ActionGridProps> = ({
  onActionPress,
  buttonScales,
  isEditMode = false,
}) => {
  const { actions, reorderActionsByIds } = useActionOrder();

  const handleDragEnd = ({
    active,
    over,
  }: {
    active: { id: string | number };
    over: { id: string | number } | null;
  }) => {
    "worklet";

    if (!over || !isEditMode) {
      return;
    }

    const overId = String(over.id).replace("drop-", "");

    if (String(active.id) !== overId) {
      reorderActionsByIds(String(active.id), overId);
    }
  };

  const handleDragStart = () => {
    "worklet";
  };

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <View className="flex-1 px-6 py-4">
        <View
          className={`bg-white rounded-3xl p-6 shadow-soft ${
            isEditMode ? "border-2 border-blue-200 bg-blue-50" : ""
          }`}
        >
          <DndProvider onBegin={handleDragStart} onDragEnd={handleDragEnd}>
            <View className="grid grid-cols-3 gap-4 w-full items-center">
              {actions.map((action, index) => (
                <DraggableActionButton
                  key={action.id}
                  action={action}
                  index={index}
                  isEditMode={isEditMode}
                  animatedValue={buttonScales[`action${index + 1}`]}
                  onPress={onActionPress}
                />
              ))}
            </View>
          </DndProvider>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};
