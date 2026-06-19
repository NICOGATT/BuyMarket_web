import { api } from "./api";

export type MercadoPagoPreference = {
  orderId: string;
  preferenceId: string;
  initPoint?: string;
  sandboxInitPoint?: string;
};

export async function createMercadoPagoPreference(
  orderId: string
): Promise<MercadoPagoPreference> {
  const response = await api.post<MercadoPagoPreference>(
    `/payments/mercadopago/create-preference/${orderId}`
  );

  return response.data;
}
