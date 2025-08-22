import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface TabItem {
  id: string;
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

interface TabNavigatorProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <View className="flex-row bg-white border-b border-neutral-200 px-4">
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;

        return (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 py-4 items-center border-b-2 ${
              isActive ? "border-blue-500" : "border-transparent"
            }`}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={isActive ? "#3b82f6" : "#6b7280"}
            />
            <Text
              className={`text-sm mt-1 font-medium ${
                isActive ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
