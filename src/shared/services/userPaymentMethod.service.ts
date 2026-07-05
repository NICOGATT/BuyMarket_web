import axios from "axios";
import { api } from "./api";
import type {
  CreateUserPaymentMethodPayload,
  UpdateUserPaymentMethodPayload,
  UserPaymentMethod,
} from "../types/UserPaymentMethod";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return fallback;
}

export async function getMyPaymentMethods(): Promise<UserPaymentMethod[]> {
  const response = await api.get<UserPaymentMethod[]>("/user-payment-methods/me");
  return response.data;
}

export async function createUserPaymentMethod(
  payload: CreateUserPaymentMethodPayload
): Promise<UserPaymentMethod> {
  try {
    const response = await api.post<UserPaymentMethod>(
      "/user-payment-methods",
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo guardar el medio de pago."),
      { cause: error }
    );
  }
}

export async function updateUserPaymentMethod(
  id: string,
  payload: UpdateUserPaymentMethodPayload
): Promise<UserPaymentMethod> {
  try {
    const response = await api.patch<UserPaymentMethod>(
      `/user-payment-methods/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo actualizar el medio de pago."),
      { cause: error }
    );
  }
}

export async function setDefaultUserPaymentMethod(
  id: string
): Promise<UserPaymentMethod> {
  try {
    const response = await api.patch<UserPaymentMethod>(
      `/user-payment-methods/${id}/default`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo marcar como predeterminado."),
      { cause: error }
    );
  }
}

export async function deleteUserPaymentMethod(id: string): Promise<void> {
  try {
    await api.delete(`/user-payment-methods/${id}`);
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "No se pudo eliminar el medio de pago."),
      { cause: error }
    );
  }
}
