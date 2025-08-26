import React from "react";
import { Animated, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ActionButton } from "./ui";
import { ActionType } from "../constants/actions";
import { ActionPosition } from "../services/ActionPositionStorageService";

interface FreeformDraggableButtonProps {
  action: ActionType;
  position: ActionPosition;
  isEditMode: boolean;
  animatedValue: Animated.Value;
  onPress: (action: ActionType) => Promise<void>;
  onPositionChange: (id: string, x: number, y: number) => void;
  containerWidth: number;
  containerHeight: number;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1,
  },
});

export const FreeformDraggableButton: React.FC<
  FreeformDraggableButtonProps
> = ({
  action,
  position,
  isEditMode,
  animatedValue,
  onPress,
  onPositionChange,
  containerWidth,
  containerHeight,
}) => {
  // Shared values for smooth animations
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  // Update position when prop changes
  React.useEffect(() => {
    translateX.value = withSpring(position.x);
    translateY.value = withSpring(position.y);
  }, [position.x, position.y, translateX, translateY]);

  // Haptic feedback functions
  const triggerHapticStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const triggerHapticEnd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Store initial position
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Pan gesture using new Gesture API
  const panGesture = Gesture.Pan()
    .enabled(isEditMode)
    .onStart(() => {
      if (isEditMode) {
        startX.value = translateX.value;
        startY.value = translateY.value;
        isDragging.value = true;
        scale.value = withSpring(1.1);
        runOnJS(triggerHapticStart)();
      }
    })
    .onUpdate(event => {
      if (!isEditMode) return;

      const buttonSize = position.width || 75;
      const padding = 10;

      // Calculate new position using initial position + translation
      const newX = startX.value + event.translationX;
      const newY = startY.value + event.translationY;

      // Constrain within bounds
      const constrainedX = Math.max(
        padding,
        Math.min(newX, containerWidth - buttonSize - padding),
      );
      const constrainedY = Math.max(
        padding,
        Math.min(newY, containerHeight - buttonSize - padding),
      );

      translateX.value = constrainedX;
      translateY.value = constrainedY;
    })
    .onEnd(() => {
      if (!isEditMode) return;

      isDragging.value = false;
      scale.value = withSpring(1);

      // Optional: snap to grid
      const gridSize = 10;
      const snappedX = Math.round(translateX.value / gridSize) * gridSize;
      const snappedY = Math.round(translateY.value / gridSize) * gridSize;

      translateX.value = withSpring(snappedX);
      translateY.value = withSpring(snappedY);

      // Update position in parent component
      runOnJS(onPositionChange)(action.id, snappedX, snappedY);
      runOnJS(triggerHapticEnd)();
    });

  // Animated style for the container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      zIndex: isDragging.value ? 999 : 1,
      elevation: isDragging.value ? 10 : 2,
    };
  });

  // Handle regular button press (not in edit mode)
  const handlePress = () => {
    if (!isEditMode) {
      onPress(action);
    }
  };

  return (
    <Reanimated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <Reanimated.View>
          <View className="relative">
            {/* Edit mode indicator */}
            {isEditMode && (
              <View className="absolute -top-2 -right-2 z-10">
                <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center shadow-md">
                  <MaterialIcons
                    name="drag-indicator"
                    size={12}
                    color="#ffffff"
                  />
                </View>
              </View>
            )}

            {/* Action Button */}
            <ActionButton
              icon={
                <MaterialIcons
                  name={action.iconName}
                  size={32}
                  color="#ffffff"
                />
              }
              onPress={handlePress}
              animatedValue={animatedValue}
              backgroundColor={action.backgroundColor}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                opacity: isEditMode ? 0.9 : 1,
                borderWidth: isEditMode ? 2 : 0,
                borderColor: isEditMode ? "#3b82f6" : "transparent",
                shadowOffset: isEditMode
                  ? { width: 0, height: 4 }
                  : { width: 0, height: 2 },
                shadowOpacity: isEditMode ? 0.3 : 0.1,
                shadowRadius: isEditMode ? 8 : 4,
                // Keep standard button size - fullscreen affects layout, not button size
              }}
              disabled={false}
            />
          </View>
        </Reanimated.View>
      </GestureDetector>
    </Reanimated.View>
  );
};
