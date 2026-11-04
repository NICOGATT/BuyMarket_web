import type { PaymentGateway } from "../types/PaymentGateway";

export const GATEWAY_UNAVAILABLE_LABEL = "No disponible por el momento";

export function findPaymentGateway(
  gateways: PaymentGateway[],
  method?: string | null
) {
  if (!method) return undefined;

  return gateways.find((gateway) => gateway.method === method);
}

/**
 * Un medio de pago esta disponible salvo que exista como pasarela y este
 * desactivado. Los medios que no son pasarelas (transferencia, efectivo) y
 * los casos en que no se pudo cargar el listado se consideran disponibles:
 * el backend igual valida al crear la orden o iniciar el pago.
 */
export function isPaymentMethodAvailable(
  gateways: PaymentGateway[],
  method?: string | null
) {
  return findPaymentGateway(gateways, method)?.isActive !== false;
}

export function getGatewayUnavailableMessage(
  gateways: PaymentGateway[],
  method?: string | null,
  fallbackName = "Este medio de pago"
) {
  const name = findPaymentGateway(gateways, method)?.name ?? fallbackName;

  return `${name} no está disponible por el momento.`;
}
