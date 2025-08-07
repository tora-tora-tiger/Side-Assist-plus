import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface StatusIndicatorProps {
  isConnected: boolean;
  variant?: "default" | "compact" | "detailed";
  animated?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isConnected,
  variant = "default",
  animated = true,
}) => {
  const getContainerClasses = () => {
    let classes = "flex-row items-center justify-center ";

    if (isConnected) {
      classes += "bg-success-50 border border-success-200 ";
    } else {
      classes += "bg-warning-50 border border-warning-200 ";
    }

    switch (variant) {
      case "compact":
        classes += "px-3 py-2 rounded-xl";
        break;
      case "detailed":
        classes += "px-6 py-4 rounded-2xl";
        break;
      default:
        classes += "px-4 py-3 rounded-2xl";
    }

    return classes;
  };

  const getStatusIcon = () => {
    if (isConnected) {
      return (
        <MaterialIcons
          name="check-circle"
          size={variant === "compact" ? 16 : 20}
          color="#16a34a"
        />
      );
    } else {
      return (
        <MaterialIcons
          name="error-outline"
          size={variant === "compact" ? 16 : 20}
          color="#ca8a04"
        />
      );
    }
  };

  const getTextClasses = () => {
    let classes = "font-semibold ml-2 ";

    if (isConnected) {
      classes += "text-success-700 ";
    } else {
      classes += "text-warning-600 ";
    }

    switch (variant) {
      case "compact":
        classes += "text-sm";
        break;
      case "detailed":
        classes += "text-lg";
        break;
      default:
        classes += "text-base";
    }

    return classes;
  };

  const getStatusText = () => {
    if (variant === "detailed") {
      return isConnected ? "Successfully Connected" : "Not Connected";
    }
    return isConnected ? "Connected" : "Not Connected";
  };

  const getSubtitleText = () => {
    if (variant !== "detailed") return null;

    if (isConnected) {
      return "Your device is connected to PC";
    } else {
      return "Connect to PC to start using the app";
    }
  };

  return (
    <View className={getContainerClasses()}>
      <View className={animated ? "animate-pulse" : ""}>{getStatusIcon()}</View>

      <View className="flex-1 ml-2">
        <Text className={getTextClasses()}>{getStatusText()}</Text>
        {variant === "detailed" && getSubtitleText() && (
          <Text className="text-neutral-600 text-sm mt-1">
            {getSubtitleText()}
          </Text>
        )}
      </View>
    </View>
  );
};
