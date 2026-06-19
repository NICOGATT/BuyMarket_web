import { api } from "./api";
import type { Order } from "../types/Order";

export type CheckoutOrderPayload = {
  deliveryAddress: string;
  paymentMethod: "mercado_pago" | "cash" | "transfer";
  notes?: string;
};

export async function getAdminOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/admin/all");

  return response.data;
}

export async function checkoutOrder(
  payload: CheckoutOrderPayload
): Promise<Order> {
  const response = await api.post<Order>("/orders/checkout", payload);

  return response.data;
}
