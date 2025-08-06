import React from 'react';
import { TouchableOpacity, View, Animated } from 'react-native';

interface ActionButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  animatedValue?: Animated.Value;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onPress,
  disabled = false,
  size = 75,
  animatedValue,
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
        }}
        className={`rounded-3xl shadow-md justify-center items-center ${
          disabled ? 'bg-gray-400' : 'bg-figma-lightGray'
        }`}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View className="w-14 h-14 justify-center items-center">{icon}</View>
      </TouchableOpacity>
    </ButtonComponent>
  );
};
