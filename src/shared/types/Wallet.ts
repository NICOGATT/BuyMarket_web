import type { User } from "./User";

export type Wallet = {
  id: string;
  balance?: number;
  isActive?: boolean;
  userId?: string;
  user?: User;
  createdAt?: string;
};

export type Withdrawal = {
  id: string;
  amount?: number;
  status?: string;
  walletId?: string;
  createdAt?: string;
  updatedAt?: string;
};
