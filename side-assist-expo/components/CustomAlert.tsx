import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Button {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Button[];
  onDismiss?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}) => {
  const handleButtonPress = (button: Button) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-8 p-6 shadow-lg">
          {/* タイトル */}
          <Text className="text-lg font-bold text-gray-900 text-center mb-3">
            {title}
          </Text>
          
          {/* メッセージ */}
          <Text className="text-base text-gray-700 text-center mb-6 leading-6">
            {message}
          </Text>

          {/* ボタン */}
          <View className="space-y-3">
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                className={`py-3 px-6 rounded-xl ${
                  button.style === 'destructive'
                    ? 'bg-red-500'
                    : button.style === 'cancel'
                    ? 'bg-gray-200'
                    : 'bg-blue-500'
                }`}
                onPress={() => handleButtonPress(button)}
              >
                <Text
                  className={`text-center font-semibold ${
                    button.style === 'cancel' ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};