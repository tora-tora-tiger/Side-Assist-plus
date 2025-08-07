import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface RecordingSectionProps {
  isRecordingPrepared: boolean;
  onPrepareRecording: () => Promise<void>;
  buttonScales: {
    recordButton: Animated.Value;
  };
}

export const RecordingSection: React.FC<RecordingSectionProps> = ({
  isRecordingPrepared,
  onPrepareRecording,
  buttonScales,
}) => {
  return (
    <View className="px-6 py-4">
      <View className="bg-white rounded-3xl p-6 shadow-soft mb-4">
        <View className="items-center">
          <Text className="text-lg font-bold text-neutral-900 mb-2">
            カスタムアクション録画
          </Text>
          <Text className="text-sm text-neutral-500 mb-4 text-center">
            デスクトップでキーボード操作を録画し、
            {"\n"}カスタムアクションとして保存できます
          </Text>

          <Animated.View
            style={{ transform: [{ scale: buttonScales.recordButton }] }}
            className="mb-2"
          >
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center ${
                isRecordingPrepared ? "bg-green-500" : "bg-red-500"
              } shadow-lg`}
              onPress={onPrepareRecording}
              activeOpacity={0.8}
              disabled={isRecordingPrepared}
            >
              <MaterialIcons
                name={
                  isRecordingPrepared ? "check-circle" : "radio-button-checked"
                }
                size={40}
                color="#ffffff"
              />
            </TouchableOpacity>
          </Animated.View>

          <Text
            className={`text-sm font-medium ${
              isRecordingPrepared ? "text-green-600" : "text-neutral-700"
            }`}
          >
            {isRecordingPrepared ? "録画準備完了" : "録画を準備する"}
          </Text>

          {isRecordingPrepared && (
            <Text className="text-xs text-green-500 mt-1 text-center">
              デスクトップで録画を開始してください
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
