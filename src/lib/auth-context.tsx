"use client";

import {
  User,
  isSignInWithEmailLink,
  onAuthStateChanged,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiPost } from "./api";
import { auth } from "./firebase";

/**
 * Passwordless (BC-09 Fase 3 §0.2, 2026-08-26) -- el backend ya está construido para este flujo
 * (`GestionarCuentaPortalClienteUseCase`, `SolicitarAccesoPortalClienteUseCase`), no para
 * contraseña. Guardar el correo acá es solo cortesía para el caso "el cliente pidió el acceso y clickeó
 * el link en el mismo navegador" -- el caso normal es que lo abra desde el correo en otro dispositivo/
 * pestaña, así que `/activar` siempre debe estar listo para pedirlo de nuevo si no está.
 */
const EMAIL_STORAGE_KEY = "motoya_email_activacion";

interface AuthContextValue {
  /** undefined = todavía no se resolvió el estado persistido; null = sin sesión. */
  user: User | null | undefined;
  isAuthenticated: boolean;
  isResolving: boolean;
  /** `POST /public/portal-cliente/solicitar-acceso` -- respuesta siempre genérica, nunca confirma si el correo existe. */
  solicitarAcceso: (email: string) => Promise<void>;
  /** Completa el sign-in con el link que llegó por correo -- requiere el mismo correo que lo pidió. */
  completarAcceso: (email: string) => Promise<void>;
  /** `true` si la URL actual es un link de activación válido de Firebase (para que `/activar` decida qué mostrar). */
  esLinkDeActivacion: () => boolean;
  /** Correo guardado en este navegador al pedir el acceso, si lo hay -- ver `EMAIL_STORAGE_KEY`. */
  emailGuardado: () => string | null;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isResolving: user === undefined,
      solicitarAcceso: async (email) => {
        await apiPost("/public/portal-cliente/solicitar-acceso", { email });
        try {
          window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
        } catch {
          // localStorage puede fallar (modo privado, storage lleno) -- no es crítico, /activar simplemente lo va a pedir de nuevo.
        }
      },
      completarAcceso: async (email) => {
        await signInWithEmailLink(auth, email, window.location.href);
        try {
          window.localStorage.removeItem(EMAIL_STORAGE_KEY);
        } catch {
          // ver nota de arriba
        }
      },
      esLinkDeActivacion: () => isSignInWithEmailLink(auth, window.location.href),
      emailGuardado: () => {
        try {
          return window.localStorage.getItem(EMAIL_STORAGE_KEY);
        } catch {
          return null;
        }
      },
      logout: () => signOut(auth),
      getIdToken: (forceRefresh = false) =>
        auth.currentUser ? auth.currentUser.getIdToken(forceRefresh) : Promise.resolve(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
