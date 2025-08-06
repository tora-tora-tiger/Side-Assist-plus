export default {
  expo: {
    name: "side-assist-expo",
    slug: "side-assist-expo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "sideassistexpo",
    userInterfaceStyle: "automatic",
    extra: {
      deviceName: process.env.EXPO_PUBLIC_DEVICE_NAME || null,
      debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === "true",
      developmentMode: process.env.EXPO_PUBLIC_DEVELOPMENT_MODE === "true"
    },
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.side-assist-expo"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.sideassistexpo"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router"
    ],
    experiments: {
      typedRoutes: true
    }
  }
};
