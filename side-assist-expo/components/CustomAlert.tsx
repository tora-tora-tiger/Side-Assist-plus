import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface Button {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
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
  buttons = [{ text: "OK" }],
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

  const button1 = buttons[0];
  const button2 = buttons[1];

  if (!visible) {
    return null;
  }

  const getButtonClasses = (buttonStyle?: string) => {
    const baseClasses = "w-full py-3 px-6 rounded-xl";
    switch (buttonStyle) {
      case "destructive":
        return `${baseClasses} bg-red-500`;
      case "cancel":
        return `${baseClasses} bg-gray-200`;
      default:
        return `${baseClasses} bg-blue-500`;
    }
  };

  const getTextClasses = (buttonStyle?: string) => {
    const baseClasses = "text-center font-semibold";
    return buttonStyle === "cancel"
      ? `${baseClasses} text-gray-700`
      : `${baseClasses} text-white`;
  };

  return (
    <View
      className="absolute inset-0 flex-1 justify-center items-center bg-black/50 z-[10000]"
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ elevation: 1000 }}
    >
      <View className="bg-white rounded-2xl p-6 w-11/12 max-w-sm shadow-lg">
        {/* タイトル */}
        <Text className="text-lg font-bold text-gray-900 text-center mb-3">
          {title}
        </Text>

        {/* メッセージ */}
        <Text className="text-base text-gray-700 text-center mb-6">
          {message}
        </Text>

        {/* ボタンエリア */}
        <View className="w-full">
          {/* ボタン1（必須） */}
          {button1 && (
            <TouchableOpacity
              className={getButtonClasses(button1.style)}
              onPress={() => handleButtonPress(button1)}
              activeOpacity={0.8}
            >
              <Text className={getTextClasses(button1.style)}>
                {button1.text}
              </Text>
            </TouchableOpacity>
          )}

          {/* ボタン2（オプション） */}
          {button2 && (
            <TouchableOpacity
              className={`${getButtonClasses(button2.style)} mt-3`}
              onPress={() => handleButtonPress(button2)}
              activeOpacity={0.8}
            >
              <Text className={getTextClasses(button2.style)}>
                {button2.text}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
