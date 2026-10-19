import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { apiFetch } from '@/lib/api';
import { decodeToken, isTokenExpired, type JwtPayload } from '@/lib/jwt';
import { clearToken, getToken, saveToken } from '@/lib/storage';

export type Session = {
  token: string;
  user: JwtPayload;
};

type AuthContextValue = {
  session: Session | null;
  /** true mientras se restaura la sesión guardada al abrir la app. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (nombre: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useSession(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useSession debe usarse dentro de <AuthProvider>');
  }
  return value;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al abrir la app: restaurar el token guardado en AsyncStorage.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await getToken();
        if (token && !isTokenExpired(token)) {
          const user = decodeToken(token);
          if (user && mounted) {
            setSession({ token, user });
          }
        } else if (token) {
          // El token guardado ya expiró: lo borramos.
          await clearToken();
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setSession(null);
  }, []);

  // Si el token expira mientras la app está abierta, cerramos sesión
  // automáticamente (lo que redirige al login).
  useEffect(() => {
    if (!session?.user.exp) return;

    const msUntilExpiry = session.user.exp * 1000 - Date.now();

    // Usamos setTimeout incluso si ya expiró, para no llamar a setState
    // de forma síncrona dentro del efecto.
    const timer = setTimeout(
      () => {
        void signOut();
      },
      Math.max(msUntilExpiry, 0)
    );

    return () => clearTimeout(timer);
  }, [session, signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    const user = decodeToken(data.token);
    if (!user) {
      throw new Error('El servidor devolvió un token inválido.');
    }

    await saveToken(data.token);
    setSession({ token: data.token, user });
  }, []);

  const signUp = useCallback(
    async (nombre: string, email: string, password: string) => {
      await apiFetch('/auth/registro', {
        method: 'POST',
        body: { nombre, email, password },
      });
      // Tras registrarse, iniciamos sesión automáticamente.
      await signIn(email, password);
    },
    [signIn]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ session, isLoading, signIn, signUp, signOut }),
    [session, isLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
