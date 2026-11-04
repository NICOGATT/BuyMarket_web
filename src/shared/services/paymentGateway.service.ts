import { api } from "./api";
import type { PaymentGateway } from "../types/PaymentGateway";

export async function getPaymentGateways(): Promise<PaymentGateway[]> {
  const response = await api.get<PaymentGateway[]>("/payment-gateways");

  return response.data;
}

export async function updatePaymentGateway(
  method: string,
  isActive: boolean
): Promise<PaymentGateway> {
  const response = await api.patch<PaymentGateway>(
    `/payment-gateways/${encodeURIComponent(method)}`,
    { isActive }
  );

  return response.data;
}
