import type { Rol } from '@/types';

export type JwtPayload = {
  id: number;
  email: string;
  rol: Rol;
  iat?: number;
  exp?: number;
};

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decodifica base64url a texto UTF-8 sin depender de `atob`/`Buffer`,
 * que no están garantizados en React Native.
 */
function base64UrlDecode(input: string): string {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4 !== 0) {
    str += '=';
  }

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of str) {
    if (char === '=') break;
    const index = BASE64_CHARS.indexOf(char);
    if (index === -1) continue;

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  // Convertir bytes a string UTF-8.
  return decodeURIComponent(
    bytes.map((b) => '%' + b.toString(16).padStart(2, '0')).join('')
  );
}

/** Extrae el payload de un JWT. Devuelve null si no se puede leer. */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

/** Comprueba si el token ya expiró (según su campo `exp`). */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}
