import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSettingsPress?: () => void;
  onClosePress?: () => void;
  onBackPress?: () => void;
  showSettings?: boolean;
  showClose?: boolean;
  showBack?: boolean;
  transparent?: boolean;
  centerTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSettingsPress,
  onClosePress,
  onBackPress,
  showSettings = false,
  showClose = false,
  showBack = false,
  transparent = false,
  centerTitle = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={transparent ? "transparent" : "#ffffff"}
        translucent={false}
      />
      <View
        style={{ paddingTop: insets.top }}
        className={transparent ? "bg-transparent" : "bg-white"}
      >
        <View
          className={`px-6 py-4 ${
            transparent
              ? "bg-transparent"
              : "bg-white border-b border-neutral-100"
          }`}
        >
          <View className="flex-row items-center justify-between min-h-[44px]">
            {/* Left Section */}
            <View className="flex-1 flex-row items-center">
              {showBack && onBackPress && (
                <TouchableOpacity
                  className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center mr-3"
                  onPress={onBackPress}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="arrow-back" size={20} color="#404040" />
                </TouchableOpacity>
              )}

              {!centerTitle && (
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-900 leading-tight">
                    {title}
                  </Text>
                  {subtitle && (
                    <Text className="text-sm text-neutral-500 mt-0.5">
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Center Section (when centerTitle is true) */}
            {centerTitle && (
              <View className="flex-2 items-center">
                <Text className="text-xl font-bold text-neutral-900 leading-tight">
                  {title}
                </Text>
                {subtitle && (
                  <Text className="text-sm text-neutral-500 mt-0.5">
                    {subtitle}
                  </Text>
                )}
              </View>
            )}

            {/* Right Section */}
            <View className="flex-1 flex-row items-center justify-end space-x-2">
              {showSettings && onSettingsPress && (
                <TouchableOpacity
                  className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center"
                  onPress={onSettingsPress}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="settings" size={20} color="#404040" />
                </TouchableOpacity>
              )}

              {showClose && onClosePress && (
                <TouchableOpacity
                  className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center"
                  onPress={onClosePress}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="close" size={20} color="#404040" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};
