import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DebugToastManager from '../../utils/DebugToastManager';

interface HeaderProps {
  title: string;
  onSettingsPress?: () => void;
  onClosePress?: () => void;
  showSettings?: boolean;
  showClose?: boolean;
  backgroundColor?: string;
  showShadow?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onSettingsPress,
  onClosePress,
  showSettings = false,
  showClose = false,
  backgroundColor = 'bg-white',
  showShadow = true,
}) => {
  return (
    <View
      className={`${backgroundColor} pt-15 pb-5 px-5 ${
        showShadow ? 'shadow-md' : ''
      }`}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1">
          <Text className="text-xl font-bold text-gray-900">{title}</Text>
        </View>

        <View className="flex-row items-center">
          {showSettings && onSettingsPress && (
            <TouchableOpacity
              className="w-11 h-11 bg-gray-50 rounded-full justify-center items-center shadow"
              onPress={() => {
                DebugToastManager.showTouchEvent('Settings Button', 'Press');
                onSettingsPress();
              }}
            >
              <MaterialIcons name="settings" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}

          {showClose && onClosePress && (
            <TouchableOpacity
              className="w-11 h-11 bg-gray-100 rounded-full justify-center items-center ml-2"
              onPress={onClosePress}
            >
              <MaterialIcons name="close" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};