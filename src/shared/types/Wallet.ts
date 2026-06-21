import type { User } from "./User";

export type Wallet = {
  id: string;
  balance?: number;
  pendingBalance?: number;
  totalEarned?: number;
  isActive?: boolean;
  userId?: string;
  user?: User;
  createdAt?: string;
};

export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "paid"
  | "rejected"
  | "cancelled";

export type Withdrawal = {
  id: string;
  amount?: number;
  status?: WithdrawalStatus;
  alias?: string;
  cbu?: string;
  adminNote?: string;
  walletId?: string;
  wallet?: Wallet;
  createdAt?: string;
  updatedAt?: string;
};
