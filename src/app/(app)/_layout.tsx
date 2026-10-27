import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Servicios' }} />
      <Stack.Screen name="nuevo" options={{ title: 'Nuevo servicio' }} />
      <Stack.Screen name="reservar" options={{ title: 'Reservar servicio' }} />
      <Stack.Screen name="mis-reservas" options={{ title: 'Mis reservas' }} />
      <Stack.Screen name="reservas" options={{ title: 'Todas las reservas' }} />
    </Stack>
  );
}
