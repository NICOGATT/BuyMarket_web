import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// La sesion viaja en la cookie httpOnly `access_token` que setea el backend,
// por eso todos los requests de esta instancia mandan credenciales.
// No usar esta instancia (ni withCredentials) contra APIs de terceros.
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// En estos endpoints un 401 es una respuesta esperada (credenciales invalidas,
// codigo vencido o simplemente "no hay sesion"), no una sesion que expiro.
const SESSIONLESS_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/me",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isSessionlessEndpoint = SESSIONLESS_AUTH_ENDPOINTS.some((endpoint) =>
        url.startsWith(endpoint)
      );

      if (!isSessionlessEndpoint) {
        unauthorizedHandler?.();
      }
    }

    return Promise.reject(error);
  }
);
