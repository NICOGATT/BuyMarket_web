import { api } from "./api";
import type { OrderStatus } from "../types/Order";

export type MercadoPagoPreference = {
  orderId: string;
  preferenceId: string;
  initPoint?: string;
  sandboxInitPoint?: string;
};

export type TransferPaymentStatusResponse = {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  message: string;
};

export async function createMercadoPagoPreference(
  orderId: string
): Promise<MercadoPagoPreference> {
  const response = await api.post<MercadoPagoPreference>(
    `/payments/mercadopago/create-preference/${orderId}`
  );

  return response.data;
}

export async function notifyTransferPayment(
  orderId: string,
  alias: string
): Promise<void> {
  await api.post(`/payments/transfer/${orderId}/notify`, {
    senderAlias: alias,
  });
}

export async function approveTransferPayment(
  orderId: string
): Promise<TransferPaymentStatusResponse> {
  const response = await api.patch<TransferPaymentStatusResponse>(
    `/payments/admin/transfer/${orderId}/status`,
    {
      status: "COMPLETED",
    }
  );

  return response.data;
}
