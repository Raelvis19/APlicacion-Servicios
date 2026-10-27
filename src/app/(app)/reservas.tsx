import { Stack, useFocusEffect } from 'expo-router';
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
import { useApi } from '@/hooks/useApi';
import { colors } from '@/theme';
import type { Reserva } from '@/types';

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    return date.toLocaleString();
  } catch {
    return iso;
  }
}

function getEstadoStyle(estado: Reserva['estado']) {
  if (estado === 'confirmada') return { bg: '#dcfce7', text: '#166534' };
  if (estado === 'cancelada') return { bg: '#fee2e2', text: '#991b1b' };
  return { bg: '#fef3c7', text: '#92400e' };
}

export default function ReservasAdminScreen() {
  const api = useApi();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const data = await api<Reserva[]>('/reservas');
      setReservas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar las reservas.');
    }
  }, [api]);

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

  const cambiarEstado = async (id: number, estado: Reserva['estado']) => {
    setError(null);
    setUpdatingId(id);
    try {
      const data = await api<{ reserva: Reserva }>(`/reservas/${id}/estado`, {
        method: 'PUT',
        body: { estado },
      });
      setReservas((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data.reserva } : r))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Todas las reservas' }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Cargando reservas…</Text>
        </View>
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={
            reservas.length === 0 ? styles.emptyContainer : styles.list
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={<ErrorMessage message={error} />}
          ListEmptyComponent={
            <Text style={styles.muted}>No hay reservas registradas.</Text>
          }
          renderItem={({ item }) => {
            const estadoStyle = getEstadoStyle(item.estado);
            const updating = updatingId === item.id;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.servicio?.nombre || 'Servicio'}</Text>
                  <View style={[styles.estadoBadge, { backgroundColor: estadoStyle.bg }]}>
                    <Text style={[styles.estadoText, { color: estadoStyle.text }]}>
                      {item.estado}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardRow}>Cliente: {item.usuario?.nombre || '-'}</Text>
                <Text style={styles.cardRow}>Email: {item.usuario?.email || '-'}</Text>
                <Text style={styles.cardRow}>Fecha: {formatDate(item.fecha)}</Text>
                {!!item.servicio?.duracion && (
                  <Text style={styles.cardRow}>Duración: {item.servicio.duracion} min</Text>
                )}
                {!!item.servicio?.precio && (
                  <Text style={styles.cardRow}>Precio: ${item.servicio.precio}</Text>
                )}

                <View style={styles.actions}>
                  <Pressable
                    style={[styles.actionBtn, styles.actionConfirm]}
                    disabled={updating || item.estado === 'confirmada'}
                    onPress={() => cambiarEstado(item.id, 'confirmada')}
                  >
                    <Text style={styles.actionText}>Confirmar</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.actionPendiente]}
                    disabled={updating || item.estado === 'pendiente'}
                    onPress={() => cambiarEstado(item.id, 'pendiente')}
                  >
                    <Text style={styles.actionText}>Pendiente</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.actionCancel]}
                    disabled={updating || item.estado === 'cancelada'}
                    onPress={() => cambiarEstado(item.id, 'cancelada')}
                  >
                    <Text style={styles.actionText}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
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
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  cardRow: {
    fontSize: 14,
    color: colors.muted,
  },
  estadoBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  estadoText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionConfirm: {
    backgroundColor: '#22c55e',
  },
  actionPendiente: {
    backgroundColor: '#f59e0b',
  },
  actionCancel: {
    backgroundColor: '#ef4444',
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
