import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
  Text,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FreeformDraggableButton } from "./FreeformDraggableButton";
import { ActionType, actions as defaultActions } from "../constants/actions";
import { useActionPositions } from "../hooks/useActionPositions";
import { positionResetNotifier } from "../utils/PositionResetNotifier";

interface FreeformActionGridProps {
  onActionPress: (action: ActionType) => Promise<void>;
  buttonScales: Record<string, Animated.Value>;
  isEditMode?: boolean;
  isFullscreen?: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  editModeBackground: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  gridContainer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  gridLine: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    position: "absolute",
  },
  gridLineHorizontal: {
    height: 1,
    left: 0,
    right: 0,
  },
  gridLineVertical: {
    bottom: 0,
    top: 0,
    width: 1,
  },
  rootView: {
    flex: 1,
  },
});

export const FreeformActionGrid: React.FC<FreeformActionGridProps> = ({
  onActionPress,
  buttonScales,
  isEditMode = false,
}) => {
  const {
    positions,
    isLoading,
    updatePosition,
    savePositions,
    initializePositions,
    forceReload,
  } = useActionPositions();

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  // Container layout handler
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setContainerSize({ width, height });

      // Initialize positions when container is measured
      if (width > 0 && height > 0) {
        initializePositions(width, height);
      }
    },
    [initializePositions],
  );

  // Save positions when edit mode is disabled
  useEffect(() => {
    if (!isEditMode && containerSize.width > 0 && containerSize.height > 0) {
      savePositions(containerSize.width, containerSize.height);
    }
  }, [isEditMode, savePositions, containerSize]);

  // Register for position reset notifications
  useEffect(() => {
    const handlePositionReset = async () => {
      await forceReload();
    };

    positionResetNotifier.addListener(handlePositionReset);

    return () => {
      positionResetNotifier.removeListener(handlePositionReset);
    };
  }, [forceReload]);

  // Handle position changes from draggable buttons
  const handlePositionChange = useCallback(
    (id: string, x: number, y: number) => {
      updatePosition(id, x, y);
    },
    [updatePosition],
  );

  // Find action by position ID
  const getActionForPosition = useCallback((positionId: string) => {
    return defaultActions.find(action => action.id === positionId);
  }, []);

  // Generate grid lines for visual guidance in edit mode
  const renderGridLines = () => {
    if (!isEditMode || containerSize.width === 0) return null;

    const gridSize = 20;
    const lines = [];

    // Vertical lines
    for (let x = 0; x <= containerSize.width; x += gridSize) {
      lines.push(
        <View
          key={`v-${x}`}
          style={[styles.gridLine, styles.gridLineVertical, { left: x }]}
        />,
      );
    }

    // Horizontal lines
    for (let y = 0; y <= containerSize.height; y += gridSize) {
      lines.push(
        <View
          key={`h-${y}`}
          style={[styles.gridLine, styles.gridLineHorizontal, { top: y }]}
        />,
      );
    }

    return (
      <View style={styles.gridContainer} pointerEvents="none">
        {lines}
      </View>
    );
  };

  // Show loading or empty state
  if (isLoading || containerSize.width === 0) {
    return (
      <GestureHandlerRootView style={styles.rootView}>
        <View className="flex-1 px-6 py-4" onLayout={handleLayout}>
          <View className="bg-white rounded-3xl p-6 shadow-soft flex-1 min-h-[200px]">
            {/* Loading placeholder */}
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <View className="flex-1 px-6 py-4" onLayout={handleLayout}>
        <View
          className={`bg-white rounded-3xl p-6 shadow-soft flex-1 min-h-[200px] ${
            isEditMode ? "border-2 border-blue-200" : ""
          }`}
          style={[
            styles.container,
            isEditMode ? styles.editModeBackground : {},
          ]}
        >
          {/* Grid lines for edit mode */}
          {renderGridLines()}

          {/* Draggable buttons */}
          {positions.map((position, index) => {
            const action = getActionForPosition(position.id);
            if (!action) {
              console.warn(
                "🎯 [FreeformActionGrid] Action not found for position:",
                position.id,
              );
              return null;
            }

            return (
              <FreeformDraggableButton
                key={position.id}
                action={action}
                position={position}
                isEditMode={isEditMode}
                animatedValue={
                  buttonScales[action.id] || buttonScales[`action${index + 1}`]
                }
                onPress={onActionPress}
                onPositionChange={handlePositionChange}
                containerWidth={containerSize.width - 48} // Account for padding
                containerHeight={containerSize.height - 48} // Account for padding
              />
            );
          })}

          {/* Edit mode instructions overlay */}
          {isEditMode && (
            <View
              className="absolute top-2 left-2 right-2 bg-blue-100 rounded-lg p-2"
              pointerEvents="none"
            >
              <View className="items-center">
                <Text className="text-blue-700 text-xs text-center">
                  📱 ボタンをドラッグして自由に配置できます
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </GestureHandlerRootView>
  );
};
