import React from 'react';
import { TouchableOpacity, Text, View, Animated } from 'react-native';
import AlertManager from '../utils/AlertManager';

interface MainButtonProps {
  isConnected: boolean;
  buttonScale: Animated.Value;
  onPress: (text: string) => Promise<void>;
}

export const MainButton: React.FC<MainButtonProps> = ({
  isConnected,
  buttonScale,
  onPress,
}) => {
  const handlePress = async () => {
    if (!isConnected) {
      AlertManager.showAlert(
        'Not Connected',
        'Please connect to Mac server first. Tap the settings button to find your Mac.',
      );
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await onPress('ultradeepthink');
  };

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <TouchableOpacity
        className={`w-70 h-70 rounded-full justify-center items-center border-2 ${
          isConnected
            ? 'bg-gray-900 border-success shadow-lg shadow-success/40'
            : 'bg-gray-800 border-gray-500 border-dashed shadow-lg shadow-error/20'
        }`}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View className="items-center justify-center">
          <Text className="text-2xl mb-2">{isConnected ? '🤝' : '🔌'}</Text>
          <Text
            className={`text-2xl font-light tracking-wider text-center ${
              isConnected ? 'text-success' : 'text-gray-600'
            }`}
          >
            ultradeepthink
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
