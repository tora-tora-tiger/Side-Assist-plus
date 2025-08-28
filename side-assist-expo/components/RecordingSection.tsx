import React, { useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface RecordingSectionProps {
  isRecordingPrepared: boolean;
  onPrepareRecording: (shortcutType: "normal" | "sequential") => Promise<void>;
  buttonScales: {
    recordButton: Animated.Value;
  };
}

export const RecordingSection: React.FC<RecordingSectionProps> = ({
  isRecordingPrepared,
  onPrepareRecording,
  buttonScales,
}) => {
  const [selectedShortcutType, setSelectedShortcutType] = useState<
    "normal" | "sequential"
  >("normal");
  return (
    <View className="px-6 py-4">
      <View className="bg-white rounded-3xl p-6 shadow-soft mb-4">
        <View className="items-center">
          <Text className="text-lg font-bold text-neutral-900 mb-2">
            カスタムアクション録画
          </Text>
          <Text className="text-sm text-neutral-500 mb-4 text-center">
            デスクトップでキーボード操作を録画し、{"\n"}
            カスタムアクションとして保存できます
          </Text>

          {/* ショートカットタイプ選択 */}
          {!isRecordingPrepared && (
            <View className="w-full mb-4">
              <Text className="text-sm font-medium text-neutral-700 mb-3 text-center">
                ショートカットタイプ
              </Text>
              <View className="space-y-2">
                <TouchableOpacity
                  className={`flex-row items-center p-3 rounded-xl ${
                    selectedShortcutType === "normal"
                      ? "bg-blue-50 border border-blue-300"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                  onPress={() => setSelectedShortcutType("normal")}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedShortcutType === "normal"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedShortcutType === "normal" && (
                      <View className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-neutral-900">
                      通常モード
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      通常のキーシーケンス（Ctrl+C, Ctrl+V等）
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-row items-center p-3 rounded-xl ${
                    selectedShortcutType === "sequential"
                      ? "bg-blue-50 border border-blue-300"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                  onPress={() => setSelectedShortcutType("sequential")}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      selectedShortcutType === "sequential"
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-400"
                    }`}
                  >
                    {selectedShortcutType === "sequential" && (
                      <View className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-neutral-900">
                      シーケンシャルモード
                    </Text>
                    <Text className="text-xs text-neutral-500">
                      修飾キー保持シーケンス（Alt → H → B → A）
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Animated.View
            style={{ transform: [{ scale: buttonScales.recordButton }] }}
            className="mb-2"
          >
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center ${
                isRecordingPrepared ? "bg-green-500" : "bg-red-500"
              } shadow-lg`}
              onPress={() => onPrepareRecording(selectedShortcutType)}
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
