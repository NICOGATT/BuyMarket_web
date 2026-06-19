import { api } from "./api";
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "../types/Auth";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", payload);

  return response.data;
}

export async function register(payload:RegisterPayload) : Promise<RegisterResponse>{
  const response = await api.post<RegisterResponse>("/auth/register", payload); 
  return response.data
}