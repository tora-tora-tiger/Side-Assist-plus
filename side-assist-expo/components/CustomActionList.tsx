import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CustomAction } from "../services/NetworkService";

interface CustomActionListProps {
  customActions: CustomAction[];
  onCustomActionPress: (action: CustomAction) => Promise<void>;
}

export const CustomActionList: React.FC<CustomActionListProps> = ({
  customActions,
  onCustomActionPress,
}) => {
  if (customActions.length === 0) {
    return null;
  }

  return (
    <View className="px-6 py-4">
      <View className="bg-white rounded-3xl p-6 shadow-soft mb-4">
        <View className="mb-4">
          <Text className="text-lg font-bold text-neutral-900 mb-2">
            保存済みカスタムアクション
          </Text>
          <Text className="text-sm text-neutral-500 mb-4">
            録画済みのキーシーケンスを実行できます ({customActions.length}
            個)
          </Text>
        </View>

        {/* カスタムアクション一覧 */}
        <View className="space-y-3">
          {customActions.map(action => (
            <TouchableOpacity
              key={action.id}
              className="bg-neutral-50 rounded-xl p-4 flex-row items-center justify-between border border-neutral-200"
              onPress={() => onCustomActionPress(action)}
              activeOpacity={0.8}
            >
              <View className="flex-1 flex-row items-center">
                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <MaterialIcons
                    name={
                      (action.icon as keyof typeof MaterialIcons.glyphMap) ||
                      "build"
                    }
                    size={18}
                    color="#ffffff"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-neutral-900 mb-1">
                    {action.name}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    {action.key_sequence.length}個のキー・
                    {new Date(action.created_at * 1000).toLocaleDateString()}
                    作成
                  </Text>
                </View>
              </View>
              <MaterialIcons name="play-arrow" size={24} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
