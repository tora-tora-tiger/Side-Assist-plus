import React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = true,
}) => {
  const getButtonClasses = () => {
    let classes = "flex-row items-center justify-center ";

    // Width
    if (fullWidth) classes += "w-full ";

    // Size classes
    switch (size) {
      case "sm":
        classes += "px-4 py-2.5 rounded-xl ";
        break;
      case "md":
        classes += "px-6 py-3 rounded-2xl ";
        break;
      case "lg":
        classes += "px-8 py-4 rounded-2xl ";
        break;
      case "xl":
        classes += "px-10 py-5 rounded-3xl ";
        break;
    }

    // State-based styles
    if (disabled || loading) {
      classes += "opacity-60 ";
    }

    // Variant styles
    switch (variant) {
      case "primary":
        classes += "bg-primary-500 shadow-soft";
        if (!disabled && !loading) classes += " active:bg-primary-600";
        break;
      case "secondary":
        classes += "bg-neutral-100 border border-neutral-200";
        if (!disabled && !loading) classes += " active:bg-neutral-200";
        break;
      case "outline":
        classes += "bg-transparent border-2 border-primary-500";
        if (!disabled && !loading) classes += " active:bg-primary-50";
        break;
      case "ghost":
        classes += "bg-transparent";
        if (!disabled && !loading) classes += " active:bg-neutral-100";
        break;
      case "danger":
        classes += "bg-danger-500 shadow-soft";
        if (!disabled && !loading) classes += " active:bg-danger-600";
        break;
    }

    return classes;
  };

  const getTextClasses = () => {
    let classes = "font-semibold ";

    // Size-based text
    switch (size) {
      case "sm":
        classes += "text-sm ";
        break;
      case "md":
        classes += "text-base ";
        break;
      case "lg":
        classes += "text-lg ";
        break;
      case "xl":
        classes += "text-xl ";
        break;
    }

    // Variant-based text color
    switch (variant) {
      case "primary":
      case "danger":
        classes += "text-white";
        break;
      case "secondary":
        classes += "text-neutral-700";
        break;
      case "outline":
        classes += "text-primary-600";
        break;
      case "ghost":
        classes += "text-neutral-700";
        break;
    }

    return classes;
  };

  const getIconColor = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return "#ffffff";
      case "secondary":
      case "ghost":
        return "#404040";
      case "outline":
        return "#0284c7";
      default:
        return "#404040";
    }
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "danger"
              ? "#ffffff"
              : "#404040"
          }
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <View className="mr-2">
              {React.cloneElement(
                icon as React.ReactElement,
                {
                  ...((icon as React.ReactElement).props || {}),
                  color: getIconColor(),
                } as Record<string, unknown>,
              )}
            </View>
          )}
          <Text className={getTextClasses()}>{title}</Text>
          {icon && iconPosition === "right" && (
            <View className="ml-2">
              {React.cloneElement(
                icon as React.ReactElement,
                {
                  ...((icon as React.ReactElement).props || {}),
                  color: getIconColor(),
                } as Record<string, unknown>,
              )}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
