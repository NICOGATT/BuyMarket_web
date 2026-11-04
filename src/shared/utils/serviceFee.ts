import type { Order } from "../types/Order";

// Comision de Payway + IVA. Solo se usa para estimar antes de crear la orden;
// el valor definitivo es el `serviceFee` que devuelve el backend.
const PAYWAY_FEE_RATE = 0.0318;
const IVA_RATE = 0.21;

export const SERVICE_FEE_LABEL = "Costo del servicio de pago";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function estimatePaywayServiceFee(subtotal: number) {
  if (subtotal <= 0) return 0;

  const grossTotal = subtotal / (1 - PAYWAY_FEE_RATE * (1 + IVA_RATE));

  return roundCurrency(grossTotal - subtotal);
}

export function getOrderServiceFee(order: Pick<Order, "serviceFee">) {
  const fee = Number(order.serviceFee);

  return Number.isFinite(fee) && fee > 0 ? fee : 0;
}

export function formatCurrency(value: number) {
  return Number(value).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}
