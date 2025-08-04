const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Build optimization
  transformer: {
    // Enable inline requires for better performance
    inlineRequires: true,
  },
  serializer: {
    // Enable module concatenation for smaller bundles
    createModuleIdFactory: () => (path) => {
      // Shorter module IDs for better performance
      return path.substr(path.lastIndexOf('/') + 1);
    },
  },
  resolver: {
    // Asset resolution optimization
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'svg'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
