import type { Product } from "./Product";
import type { User } from "./User";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "on_the_way"
  | "paid"
  | "delivered"
  | "cancelled"
  | "rejected"
  | "review";

export type OrderItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
};

export type PaymentStatus = "PENDING" | "COMPLETED" | "REJECTED";

export type OrderPayment = {
  id: string;
  status: PaymentStatus;
  method?: string;
  amount?: number;
  senderAlias?: string;
  senderCbu?: string;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Order = {
  id: string;
  buyer?: User;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  payment?: OrderPayment;
  notes?: string;
  createdAt?: string;
};
