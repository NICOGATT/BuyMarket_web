import { api } from "./api";
import type {
  CreateUserAddressPayload,
  UpdateUserAddressPayload,
  UserAddress,
} from "../types/UserAddress";

export async function getMyAddresses(): Promise<UserAddress[]> {
  const response = await api.get<UserAddress[]>("/user-addresses/me");
  return response.data;
}

export async function createUserAddress(
  payload: CreateUserAddressPayload
): Promise<UserAddress> {
  const response = await api.post<UserAddress>("/user-addresses", payload);
  return response.data;
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
