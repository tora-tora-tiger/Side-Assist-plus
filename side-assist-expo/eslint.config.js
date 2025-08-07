const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const reactNative = require("eslint-plugin-react-native");
const prettier = require("eslint-plugin-prettier");
const globals = require("globals");

module.exports = tseslint.config(
  {
    ignores: [
      "**/*.config.js",
      "**/expo-env.d.ts",
      "**/__tests__/**",
      "**/node_modules/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        __DEV__: "readonly",
        global: "readonly",
        fetch: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-native": reactNative,
      prettier,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactNative.configs.all.rules,
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-native/no-unused-styles": "error",
      "react-native/split-platform-components": "off",
      "react-native/no-inline-styles": "warn",
      "react-native/no-color-literals": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
