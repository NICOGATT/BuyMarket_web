import type { Wallet } from "./Wallet";

export type User = {
  id: string;
  name?: string;
  firstName?: string;
  lastName? : string;
  email: string;
  role?: "admin" | "user" | "seller";
  isActive?: boolean;
  createdAt?: string;
  wallet?: Wallet | null;
  walletId?: string | null;
};
