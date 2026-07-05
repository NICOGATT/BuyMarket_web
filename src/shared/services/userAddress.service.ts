import { api } from "./api";
import axios from "axios";
import type {
  CreateUserAddressPayload,
  UpdateUserAddressPayload,
  UserAddress,
} from "../types/UserAddress";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return fallback;
}

export async function getMyAddresses(): Promise<UserAddress[]> {
  const response = await api.get<UserAddress[]>("/user-addresses/me");
  return response.data;
}

export async function createUserAddress(
  payload: CreateUserAddressPayload
): Promise<UserAddress> {
  try {
    const response = await api.post<UserAddress>("/user-addresses", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo guardar la direccion."), {
      cause: error,
    });
  }
}

export async function updateUserAddress(
  id: string,
  payload: UpdateUserAddressPayload
): Promise<UserAddress> {
  const response = await api.patch<UserAddress>(`/user-addresses/${id}`, payload);
  return response.data;
}

export async function setDefaultUserAddress(id: string): Promise<UserAddress> {
  const response = await api.patch<UserAddress>(`/user-addresses/${id}/default`);
  return response.data;
}

export async function deleteUserAddress(id: string): Promise<void> {
  await api.delete(`/user-addresses/${id}`);
}
