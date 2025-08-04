import React from 'react';
import { TouchableOpacity, Text, View, Animated, Alert } from 'react-native';
import { buttonStyles } from '../styles/commonStyles';

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
      Alert.alert(
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
        style={[
          buttonStyles.mainButton,
          isConnected
            ? buttonStyles.mainButtonConnected
            : buttonStyles.mainButtonDisconnected,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={buttonStyles.buttonContent}>
          <Text style={buttonStyles.buttonIcon}>
            {isConnected ? '🤝' : '🔌'}
          </Text>
          <Text
            style={[
              buttonStyles.mainButtonText,
              isConnected
                ? buttonStyles.mainButtonTextConnected
                : buttonStyles.mainButtonTextDisconnected,
            ]}
          >
            ultradeepthink
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
