import axios from "axios";
import { useSyncExternalStore } from "react";
import { setUnauthorizedHandler } from "../services/api";
import {
  getCurrentAuthUser,
  logout as logoutRequest,
} from "../services/auth.service";
import type { AuthUser } from "../types/Auth";

// La sesion vive en una cookie httpOnly que el front no puede leer: el unico
// origen de verdad es GET /auth/me. Este modulo guarda en memoria el usuario
// que devolvio el backend y avisa a la UI cuando cambia.

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export type AuthSession = {
  status: SessionStatus;
  user: AuthUser | null;
};

export const AUTH_CHANGE_EVENT = "auth-change";

const EMAIL_VERIFIED_PREFIX = "email-verified:";

let session: AuthSession = { status: "loading", user: null };
let latestRequestId = 0;
const listeners = new Set<() => void>();

function setSession(nextSession: AuthSession) {
  session = nextSession;
  listeners.forEach((listener) => listener());
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSessionSnapshot() {
  return session;
}

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSessionSnapshot);
}

export function getCurrentUser() {
  return session.user;
}

/**
 * Consulta /auth/me y actualiza la sesion. Se usa al cargar la app y despues
 * de cualquier accion que setee la cookie (login, registro, Google, verificar
 * email). Devuelve el usuario o null si no hay sesion.
 */
export async function refreshSession(): Promise<AuthUser | null> {
  const requestId = ++latestRequestId;

  try {
    const user = await getCurrentAuthUser();

    if (requestId === latestRequestId) {
      setSession({ status: "authenticated", user });
    }

    return user;
  } catch (error) {
    const isUnauthorized =
      axios.isAxiosError(error) && error.response?.status === 401;

    // Un error de red o 5xx no prueba que la sesion se haya cerrado: si ya
    // habia un usuario lo mantenemos y dejamos que el proximo request decida.
    if (
      requestId === latestRequestId &&
      (isUnauthorized || session.status === "loading")
    ) {
      setSession({ status: "anonymous", user: null });
    }

    return isUnauthorized ? null : session.user;
  }
}

export function clearSession() {
  // Invalida cualquier /auth/me en vuelo para que no reviva la sesion.
  latestRequestId += 1;
  setSession({ status: "anonymous", user: null });
}

export async function logout() {
  try {
    await logoutRequest();
  } catch {
    // Aunque falle el request, limpiamos el estado local igual.
  } finally {
    clearSession();
  }
}

// Si un request autenticado devuelve 401, la cookie vencio o fue revocada.
// Al limpiar la sesion, ProtectedRoute/AdminRoute redirigen al login.
setUnauthorizedHandler(() => {
  if (session.user) {
    clearSession();
  }
});

type EmailVerificationUser = Pick<AuthUser, "id" | "sub" | "email">;

export function getEmailVerificationKey(user: EmailVerificationUser) {
  const userKey = user.id || user.sub || user.email;

  return userKey ? `${EMAIL_VERIFIED_PREFIX}${userKey}` : null;
}

export function isEmailVerifiedLocally(user: EmailVerificationUser) {
  const key = getEmailVerificationKey(user);

  return key ? localStorage.getItem(key) === "true" : false;
}

export function markEmailVerifiedLocally(user: EmailVerificationUser) {
  const key = getEmailVerificationKey(user);

  if (key) {
    localStorage.setItem(key, "true");
  }
}

export function isEmailVerifiedFromUser(
  user?: Pick<AuthUser, "emailVerified" | "isEmailVerified"> | null
) {
  return user?.emailVerified === true || user?.isEmailVerified === true;
}
