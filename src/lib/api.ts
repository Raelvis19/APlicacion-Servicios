import Constants from 'expo-constants';

type ExtraConfig = { apiUrl?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

/**
 * URL de la API. NO está hardcodeada en el código de las pantallas:
 * viene de `extra.apiUrl` en app.config.js, y puede sobreescribirse con
 * la variable de entorno EXPO_PUBLIC_API_URL.
 */
export const API_URL: string =
  extra.apiUrl ?? 'http://apiservicios.raelvispaulino.dev';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
      0
    );
  }

  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data?.error ?? data?.mensaje ?? `Error inesperado (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}
