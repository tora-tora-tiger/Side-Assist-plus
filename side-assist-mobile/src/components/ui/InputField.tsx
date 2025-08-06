import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required = false,
  ...textInputProps
}) => {
  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-2">
        {label}
        {required && <Text className="text-error"> *</Text>}
      </Text>
      <TextInput
        className={`border rounded-xl px-4 py-3 text-base bg-white ${
          error ? 'border-error' : 'border-gray-300'
        }`}
        placeholderTextColor="#999999"
        {...textInputProps}
      />
      {error && <Text className="text-error text-sm mt-1">{error}</Text>}
    </View>
  );
};
