module.exports = {
  expo: {
    name: 'ServiciosApp',
    slug: 'ServiciosApp',
    scheme: 'serviciosapp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      usesCleartextTraffic: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-status-bar'],
    extra: {
      
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ??
        'https://api-servicios-production-5385.up.railway.app',
    },
  },
};

