import { useCallback } from 'react';

import { useSession } from '@/context/auth';
import { ApiError, apiFetch } from '@/lib/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

/**
 * Envuelve `apiFetch` añadiendo el token de la sesión actual.
 * Si el servidor responde 401 (token inválido/expirado), cierra sesión
 * automáticamente, lo que redirige al login gracias a las rutas protegidas.
 */
export function useApi() {
  const { session, signOut } = useSession();

  return useCallback(
    async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
      try {
        return await apiFetch<T>(path, { ...options, token: session?.token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await signOut();
        }
        throw error;
      }
    },
    [session, signOut]
  );
}
