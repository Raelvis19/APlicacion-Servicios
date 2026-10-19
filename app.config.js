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
      // Permite tráfico en claro: útil si pruebas contra tu backend local
      // (http://192.168.x.x:3000). La API de producción es https.
      usesCleartextTraffic: true,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-status-bar'],
    extra: {
      // La URL de la API NO se hardcodea en el código: se lee desde aquí
      // con Constants.expoConfig.extra.apiUrl (ver src/lib/api.ts).
      // IMPORTANTE: Railway redirige http -> https (301), y eso rompe los
      // POST (login/registro). Por eso debe usarse https://.
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ??
        'https://api-servicios-production-5385.up.railway.app',
    },
  },
};

