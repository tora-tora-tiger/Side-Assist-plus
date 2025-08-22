import React from "react";
import { TouchableOpacity, View, Animated, ViewStyle } from "react-native";

interface ActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  animatedValue?: Animated.Value;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onPress,
  disabled = false,
  size = 75,
  animatedValue,
  backgroundColor = "#e5e7eb",
  style,
}) => {
  const ButtonComponent = animatedValue ? Animated.View : View;
  const animatedStyle = animatedValue
    ? { transform: [{ scale: animatedValue }] }
    : {};

  const buttonStyle = {
    width: size,
    height: size,
    backgroundColor: disabled ? "#a3a3a3" : backgroundColor,
    ...style,
  };

  return (
    <ButtonComponent style={animatedStyle}>
      <TouchableOpacity
        style={buttonStyle}
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
