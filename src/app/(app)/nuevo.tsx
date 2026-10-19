import { Stack, useRouter } from 'expo-router';
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
import type { Servicio } from '@/types';

export default function NuevoServicioScreen() {
  const { session } = useSession();
  const api = useApi();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [precio, setPrecio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user.rol === 'admin';

  // Ruta solo para administradores (además, el botón no se muestra a clientes).
  if (!isAdmin) {
    return (
      <View style={styles.denied}>
        <Text style={styles.deniedTitle}>Acceso denegado</Text>
        <Text style={styles.muted}>
          Solo los administradores pueden crear servicios.
        </Text>
      </View>
    );
  }

  const onSubmit = async () => {
    setError(null);

    const duracionNum = Number(duracion);
    const precioNum = Number(precio);

    if (
      !nombre.trim() ||
      !descripcion.trim() ||
      !duracion.trim() ||
      !precio.trim()
    ) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (!Number.isInteger(duracionNum) || duracionNum <= 0) {
      setError('La duración debe ser un número entero mayor que 0.');
      return;
    }
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      setError('El precio debe ser un número mayor o igual a 0.');
      return;
    }

    setLoading(true);
    try {
      await api<Servicio>('/servicios', {
        method: 'POST',
        body: {
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          duracion: duracionNum,
          precio: precioNum,
        },
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el servicio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Nuevo servicio' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorMessage message={error} />

        <FormField
          label="Nombre"
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. Corte de cabello"
          editable={!loading}
        />

        <FormField
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe el servicio"
          multiline
          editable={!loading}
        />

        <FormField
          label="Duración (minutos)"
          value={duracion}
          onChangeText={setDuracion}
          placeholder="30"
          keyboardType="number-pad"
          editable={!loading}
        />

        <FormField
          label="Precio"
          value={precio}
          onChangeText={setPrecio}
          placeholder="15"
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <PrimaryButton title="Guardar servicio" onPress={onSubmit} loading={loading} />
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
});
