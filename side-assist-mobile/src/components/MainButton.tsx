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
        className={`mx-5 mb-8 mt-auto rounded-4xl py-8 px-8 shadow-2xl ${
          isConnected ? 'bg-primary' : 'bg-gray-300'
        }`}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View className="items-center">
          <Text className="text-5xl mb-3">{isConnected ? '🤝' : '🔌'}</Text>
          <Text
            className={`text-2xl font-bold ${
              isConnected ? 'text-white' : 'text-gray-500'
            }`}
          >
            ultradeepthink
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
