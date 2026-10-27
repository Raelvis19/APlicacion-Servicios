import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/ErrorMessage';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSession } from '@/context/auth';
import { useApi } from '@/hooks/useApi';
import { colors } from '@/theme';

export default function ReservarScreen() {
  const { session } = useSession();
  const api = useApi();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user.rol === 'admin';

  if (isAdmin) {
    return (
      <View style={styles.denied}>
        <Text style={styles.deniedTitle}>Acceso denegado</Text>
        <Text style={styles.muted}>
          Los administradores no pueden reservar servicios.
        </Text>
      </View>
    );
  }

  const onSubmit = async () => {
    setError(null);

    if (!params.id) {
      setError('Servicio no válido.');
      return;
    }
    if (!fecha.trim()) {
      setError('Debes indicar fecha y hora.');
      return;
    }

    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      setError('Formato de fecha inválido. Usa ISO 8601 (ej. 2026-10-28T10:00:00).');
      return;
    }

    setLoading(true);
    try {
      await api('/reservas', {
        method: 'POST',
        body: {
          servicioId: Number(params.id),
          fecha: fechaDate.toISOString(),
        },
      });
      router.replace('/mis-reservas');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la reserva.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Reservar servicio' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorMessage message={error} />

        <FormField
          label="Fecha y hora"
          value={fecha}
          onChangeText={setFecha}
          placeholder="2026-10-28T10:00:00"
          editable={!loading}
        />
        <Text style={styles.hint}>
          Usa formato ISO 8601. Ejemplo: 2026-10-28T10:00:00
        </Text>

        <PrimaryButton title="Confirmar reserva" onPress={onSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 12,
  },
  denied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 8,
  },
  muted: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: -4,
  },
});
