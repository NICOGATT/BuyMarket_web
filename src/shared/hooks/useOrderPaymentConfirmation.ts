import { useEffect, useState } from "react";
import { getOrderById } from "../services/order.service";
import type { Order } from "../types/Order";

export type PaymentConfirmationState = "confirming" | "paid" | "unconfirmed";

const POLL_INTERVAL_MS = 4000;
const MAX_ATTEMPTS = 25; // ~100 segundos

// Aislado a propósito: cuando el backend confirme el pago en tiempo real
// alcanza con simplificar o quitar este polling.
export function useOrderPaymentConfirmation(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<PaymentConfirmationState>("confirming");

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let attempts = 0;
    let timeout: number | undefined;

    async function check() {
      attempts += 1;

      try {
        const current = await getOrderById(orderId!);

        if (cancelled) return;

        setOrder(current);

        if (current.status === "paid") {
          setState("paid");
          return;
        }

        if (current.status === "rejected" || current.status === "cancelled") {
          setState("unconfirmed");
          return;
        }
      } catch {
        // Error transitorio: se reintenta hasta agotar los intentos.
      }

      if (cancelled) return;

      if (attempts >= MAX_ATTEMPTS) {
        setState("unconfirmed");
        return;
      }

      timeout = window.setTimeout(check, POLL_INTERVAL_MS);
    }

    void check();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [orderId]);

  return { order, state };
}
