import { api } from "./api";
import type {
  LoginPayload,
  LoginResponse,
  AuthUser,
  GoogleAuthPayload,
  GoogleAuthResponse,
  RegisterPayload,
  RegisterResponse,
  SendVerificationCodeResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from "../types/Auth";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", payload);

  return response.data;
}

export async function register(payload:RegisterPayload) : Promise<RegisterResponse>{
  const response = await api.post<RegisterResponse>("/auth/register", payload); 
  return response.data
}

export async function sendVerificationCode(): Promise<SendVerificationCodeResponse> {
  const response = await api.post<SendVerificationCodeResponse>(
    "/auth/send-verification-code"
  );

  return response.data;
}

export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<VerifyEmailResponse> {
  const response = await api.post<VerifyEmailResponse>("/auth/verify-email", payload);

  return response.data;
}

export async function getCurrentAuthUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/auth/me");

  return response.data;
}

export async function loginWithGoogle(
  payload: GoogleAuthPayload
): Promise<GoogleAuthResponse> {
  const response = await api.post<GoogleAuthResponse>("/auth/google", payload);

  return response.data;
}
