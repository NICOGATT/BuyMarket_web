import { api } from "./api";
import axios from "axios";
import type { Order, Sale } from "../types/Order";

export type ShipmentType = "local" | "national";

export type CheckoutOrderPayload = {
  deliveryAddress: string;
  paymentMethod?: "mercado_pago" | "cash" | "transfer";
  paymentMethodId?: string;
  notes?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;

  return fallback;
}

export async function getAdminOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/admin/all");

  return response.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/my-orders");

  return response.data;
}

export async function getMySales(): Promise<Sale[]> {
  const response = await api.get<Sale[]>("/orders/my-sales");

  return response.data;
}

export async function checkoutOrder(
  payload: CheckoutOrderPayload
): Promise<Order> {
  try {
    const response = await api.post<Order>("/orders/checkout", payload);

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo confirmar la compra."), {
      cause: error,
    });
  }
}
