import type { Product } from "./Product";
import type { User } from "./User";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled"
  | "review";

export type OrderItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  buyer?: User;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
};