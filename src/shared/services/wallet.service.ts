import { api } from "./api";
import type { Wallet, Withdrawal } from "../types/Wallet";

type WalletBalanceResponse = number | { balance?: number } | Wallet | null;

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

export async function syncMissingWallets(): Promise<Wallet[]> {
  const response = await api.post<Wallet[]>("/wallets/admin/sync-missing-wallets");
  return response.data;
}
