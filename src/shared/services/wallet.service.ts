import { api } from "./api";
import type { Wallet, Withdrawal, WithdrawalStatus } from "../types/Wallet";

type WalletBalanceResponse = number | { balance?: number } | Wallet | null;

export type CreateWithdrawalPayload = {
  amount: number;
  alias?: string;
  cbu?: string;
};

export type UpdateWithdrawalStatusPayload = {
  status: Extract<WithdrawalStatus, "paid" | "rejected">;
  adminNote?: string;
};

export async function getWallets(): Promise<Wallet[]> {
  const response = await api.get<Wallet[]>("/wallets");
  return response.data;
}

export async function getMyWallet(): Promise<Wallet> {
  const response = await api.get<Wallet>("/wallets/me");
  return response.data;
}

export async function getMyWalletBalance(): Promise<number> {
  const response = await api.get<WalletBalanceResponse>("/wallets/me/balance");
  const data = response.data;

  if (!data) return 0;
  if (typeof data === "number") return data;

  return data.balance ?? 0;
}

export async function getMyWithdrawals(): Promise<Withdrawal[]> {
  const response = await api.get<Withdrawal[]>("/wallets/withdrawals/me");
  return response.data;
}

export async function requestWithdrawal(
  payload: CreateWithdrawalPayload
): Promise<Withdrawal> {
  const response = await api.post<Withdrawal>("/wallets/withdrawals", payload);
  return response.data;
}

export async function getAdminWithdrawals(): Promise<Withdrawal[]> {
  const response = await api.get<Withdrawal[]>("/wallets/admin/withdrawals/all");
  return response.data;
}

export async function updateWithdrawalStatus(
  id: string,
  payload: UpdateWithdrawalStatusPayload
): Promise<Withdrawal> {
  const response = await api.patch<Withdrawal>(
    `/wallets/admin/withdrawals/${id}/status`,
    payload
  );
  return response.data;
}

export async function syncMissingWallets(): Promise<Wallet[]> {
  const response = await api.post<Wallet[]>("/wallets/admin/sync-missing-wallets");
  return response.data;
}
