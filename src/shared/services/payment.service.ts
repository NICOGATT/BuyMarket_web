import { api } from "./api";
import axios from "axios";
import type { OrderStatus } from "../types/Order";

export type MercadoPagoPreference = {
  orderId: string;
  preferenceId: string;
  initPoint?: string;
  sandboxInitPoint?: string;
};

export type ManualPaymentStatusResponse = {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  message: string;
};

export type TransferPaymentStatusResponse = ManualPaymentStatusResponse;

export type PaymentCapabilities = {
  getnetQrEnabled: boolean;
};

export type GetnetQrPayment = {
  orderId: string;
  paymentAttemptId: string;
  qrPayload: string;
  expiresAt: string;
  paymentStatus: "PENDING";
};

export type GetnetCheckoutResponse = {
  orderId: string;
  paymentIntentId: string;
  checkoutType: "redirect" | "iframe";
  checkoutUrl?: string;
  loaderUrl?: string;
};

export async function getPaymentCapabilities(): Promise<PaymentCapabilities> {
  const response = await api.get<PaymentCapabilities>("/payments/capabilities");

  return response.data;
}

export async function createGetnetOrder(
  orderId: string
): Promise<GetnetCheckoutResponse> {
  const response = await api.post<GetnetCheckoutResponse>(
    `/payments/getnet/create-order/${orderId}`
  );

  return response.data;
}

export async function createGetnetQrPayment(
  orderId: string
): Promise<GetnetQrPayment> {
  const response = await api.post<GetnetQrPayment>(
    `/payments/getnet-qr/create/${orderId}`
  );

  return response.data;
}

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

export async function uploadTransferProof(
  paymentId: string,
  file: File
): Promise<void> {
  const formData = new FormData();

  formData.append("file", file);

  try {
    await api.post(`/payments/${paymentId}/proof`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 413) {
      throw new Error("El comprobante no puede superar los 5 MB.", {
        cause: error,
      });
    }

    throw error;
  }
}

export async function approveManualPayment(
  orderId: string
): Promise<ManualPaymentStatusResponse> {
  const response = await api.patch<ManualPaymentStatusResponse>(
    `/payments/admin/manual/${orderId}/status`,
    {
      status: "COMPLETED",
    }
  );

  return response.data;
}

export async function approveTransferPayment(
  orderId: string
): Promise<ManualPaymentStatusResponse> {
  const response = await api.patch<ManualPaymentStatusResponse>(
    `/payments/admin/transfer/${orderId}/status`,
    {
      status: "COMPLETED",
    }
  );

  return response.data;
}
