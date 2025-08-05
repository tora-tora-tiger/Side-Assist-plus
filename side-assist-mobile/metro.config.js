const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Fix InitializeCore.js module resolution
  serializer: {
    getRunBeforeMainModule: entryFilePath => [
      'node_modules/react-native/Libraries/Core/InitializeCore.js',
    ],
  },
  resolver: {
    // Standard asset extensions
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'svg'],
  },
};

module.exports = withNativeWind(
  mergeConfig(getDefaultConfig(__dirname), config),
  {
    input: './global.css',
  },
);
