import axios from "axios";

// Algunos services envuelven el error de axios en un Error con `cause`.
function findAxiosError(error: unknown) {
  if (axios.isAxiosError(error)) return error;

  if (error instanceof Error && axios.isAxiosError(error.cause)) {
    return error.cause;
  }

  return undefined;
}

export function getApiErrorStatus(error: unknown) {
  return findAxiosError(error)?.response?.status;
}

/** Lee `message` del formato de error estandar de Nest ({ statusCode, message, error }). */
export function getApiErrorMessage(error: unknown, fallback: string) {
  const message = findAxiosError(error)?.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
}
