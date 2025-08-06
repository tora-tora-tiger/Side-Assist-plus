import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

interface DebugToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const DebugToast: React.FC<DebugToastProps> = ({
  message,
  visible,
  onHide,
  duration = 2000,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // フェードイン
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // 指定時間後にフェードアウト
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, fadeAnim, duration, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        zIndex: 9999,
        opacity: fadeAnim,
      }}
      className="bg-blue-500 px-4 py-2 rounded-lg shadow-lg"
    >
      <Text className="text-white text-sm font-bold text-center">
        🐛 DEBUG: {message}
      </Text>
      <Text className="text-blue-100 text-xs text-center mt-1">
        {new Date().toLocaleTimeString()}
      </Text>
    </Animated.View>
  );
};