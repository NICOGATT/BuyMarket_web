import type { Wallet } from "./Wallet";
import type { Plan } from "./Plan";

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
  plan?: Plan | null;
};
