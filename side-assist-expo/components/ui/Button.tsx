import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  icon,
  loading = false,
  size = 'medium',
}) => {
  const getButtonStyle = () => {
    let baseStyle = 'rounded-3xl drop-shadow-figma ';

    // サイズ設定
    switch (size) {
      case 'small':
        baseStyle += 'py-2 px-4 ';
        break;
      case 'large':
        baseStyle += 'py-5 px-8 ';
        break;
      default:
        baseStyle += 'py-4 px-6 ';
    }

    // 色設定
    if (disabled || loading) {
      return baseStyle + 'bg-gray-400';
    }

    switch (variant) {
      case 'primary':
        return baseStyle + 'bg-figma-primary';
      case 'secondary':
        return baseStyle + 'bg-figma-secondary';
      case 'danger':
        return baseStyle + 'bg-figma-danger';
      default:
        return baseStyle + 'bg-figma-primary';
    }
  };

  const getTextStyle = () => {
    let baseStyle = 'font-semibold ';

    // サイズ設定
    switch (size) {
      case 'small':
        baseStyle += 'text-base ';
        break;
      case 'large':
        baseStyle += 'text-xl ';
        break;
      default:
        baseStyle += 'text-lg ';
    }

    // 色設定
    if (disabled || loading) {
      return baseStyle + 'text-gray-600';
    }

    switch (variant) {
      case 'secondary':
        return baseStyle + 'text-gray-800';
      default:
        return baseStyle + 'text-white';
    }
  };

  return (
    <TouchableOpacity
      className={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        {icon && <View className="mr-2">{icon}</View>}
        <Text className={getTextStyle()}>
          {loading ? '読み込み中...' : title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};