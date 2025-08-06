import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
  secureTextEntry?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  maxLength,
  secureTextEntry = false,
  disabled = false,
  error,
  hint,
  required = false,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const showPasswordToggle = secureTextEntry;

  const getContainerClasses = () => {
    let classes = 'mb-4';
    return classes;
  };

  const getInputContainerClasses = () => {
    let classes = 'flex-row items-center bg-white border rounded-2xl px-4 py-4 ';
    
    if (hasError) {
      classes += 'border-danger-500 ';
    } else if (isFocused) {
      classes += 'border-primary-500 shadow-glow ';
    } else {
      classes += 'border-neutral-200 ';
    }

    if (disabled) {
      classes += 'bg-neutral-100 ';
    }

    return classes;
  };

  const getInputClasses = () => {
    let classes = 'flex-1 text-base text-neutral-900 ';
    
    if (disabled) {
      classes += 'text-neutral-500 ';
    }

    return classes;
  };

  const getLabelClasses = () => {
    let classes = 'text-base font-semibold mb-2 ';
    
    if (hasError) {
      classes += 'text-danger-600 ';
    } else {
      classes += 'text-neutral-700 ';
    }

    return classes;
  };

  return (
    <View className={getContainerClasses()}>
      {/* Label */}
      <View className="flex-row items-center mb-2">
        <Text className={getLabelClasses()}>
          {label}
        </Text>
        {required && (
          <Text className="text-danger-500 ml-1">*</Text>
        )}
      </View>

      {/* Input Container */}
      <View className={getInputContainerClasses()}>
        <TextInput
          className={getInputClasses()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a3a3a3"
          keyboardType={keyboardType}
          maxLength={maxLength}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Password Toggle */}
        {showPasswordToggle && (
          <TouchableOpacity
            className="ml-3 p-1"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={20}
              color="#737373"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <View className="flex-row items-center mt-2">
          <MaterialIcons name="error-outline" size={16} color="#dc2626" />
          <Text className="text-danger-600 text-sm ml-2 flex-1">
            {error}
          </Text>
        </View>
      )}

      {/* Hint Message */}
      {hint && !hasError && (
        <Text className="text-neutral-500 text-sm mt-2">
          {hint}
        </Text>
      )}
    </View>
  );
};