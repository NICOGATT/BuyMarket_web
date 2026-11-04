// Pasarela administrable desde el panel. `method` coincide con el medio de
// pago de la orden (mercado_pago, getnet_qr, payway, ...). Transferencia y
// efectivo no son pasarelas: no aparecen en el listado y siempre estan
// disponibles.
export type PaymentGateway = {
  method: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};
