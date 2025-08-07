import React from "react";
import { TouchableOpacity, View, Animated } from "react-native";

interface ActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  animatedValue?: Animated.Value;
  backgroundColor?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onPress,
  disabled = false,
  size = 75,
  animatedValue,
  backgroundColor = "#e5e7eb",
}) => {
  const ButtonComponent = animatedValue ? Animated.View : View;
  const animatedStyle = animatedValue
    ? { transform: [{ scale: animatedValue }] }
    : {};

  return (
    <ButtonComponent style={animatedStyle}>
      <TouchableOpacity
        style={{
          width: size,
          height: size,
          backgroundColor: disabled ? "#a3a3a3" : backgroundColor,
        }}
        className="rounded-3xl shadow-soft justify-center items-center"
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View className="w-14 h-14 justify-center items-center">{icon}</View>
      </TouchableOpacity>
    </ButtonComponent>
  );
};
