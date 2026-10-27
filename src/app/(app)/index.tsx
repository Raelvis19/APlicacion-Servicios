import { useFocusEffect, Stack, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/ErrorMessage';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useSession } from '@/context/auth';
import { useApi } from '@/hooks/useApi';
import { colors } from '@/theme';
import type { Servicio } from '@/types';

export default function ServiciosScreen() {
  const { session, signOut } = useSession();
  const api = useApi();
  const router = useRouter();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user.rol === 'admin';

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const data = await api<Servicio[]>('/servicios');
      setServicios(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los servicios.');
    }
  }, [api]);

  // Recarga cada vez que la pantalla recibe el foco (por ejemplo,
  // al volver de crear un servicio).
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        await cargar();
        if (active) setLoading(false);
      })();

      return () => {
        active = false;
      };
    }, [cargar])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await cargar();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerRight}>
              {!isAdmin && (
                <Pressable onPress={() => router.push('/mis-reservas')} hitSlop={10}>
                  <Text style={styles.headerLink}>Mis reservas</Text>
                </Pressable>
              )}
              {isAdmin && (
                <Pressable onPress={() => router.push('/reservas')} hitSlop={10}>
                  <Text style={styles.headerLink}>Reservas</Text>
                </Pressable>
              )}
              <Pressable onPress={signOut} hitSlop={10}>
                <Text style={styles.headerAction}>Salir</Text>
              </Pressable>
            </View>
          ),
        }}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Cargando servicios…</Text>
        </View>
      ) : (
        <FlatList
          data={servicios}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={
            servicios.length === 0 ? styles.emptyContainer : styles.list
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={<ErrorMessage message={error} />}
          ListEmptyComponent={
            <Text style={styles.muted}>No hay servicios disponibles todavía.</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: '/reservar', params: { id: String(item.id) } })}
              disabled={isAdmin}
            >
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              {!!item.descripcion && (
                <Text style={styles.cardDesc}>{item.descripcion}</Text>
              )}
              <View style={styles.cardFooter}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.duracion} min</Text>
                </View>
                <Text style={styles.precio}>${item.precio}</Text>
              </View>
              {!isAdmin && <Text style={styles.tapHint}>Toca para reservar</Text>}
            </Pressable>
          )}
        />
      )}

      {isAdmin && !loading && (
        <View style={styles.footer}>
          <PrimaryButton
            title="+ Crear servicio"
            onPress={() => router.push('/nuevo')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 14,
    color: colors.muted,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: colors.badgeBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.badgeText,
    fontSize: 13,
    fontWeight: '600',
  },
  precio: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerAction: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  tapHint: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 13,
  },
});
