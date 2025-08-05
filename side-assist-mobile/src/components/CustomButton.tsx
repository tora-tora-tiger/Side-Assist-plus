import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface CustomButtonProps {
  title: string;
  isActive: boolean;
  isLoading?: boolean;
  onPress: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  isActive,
  isLoading = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      className={`rounded-xl py-4 px-6 ${
        isActive ? 'bg-primary' : 'bg-gray-300'
      }`}
      onPress={onPress}
      disabled={!isActive || isLoading}
    >
      <Text className="text-white text-lg font-semibold text-center">
        {isLoading ? '処理中...' : title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
