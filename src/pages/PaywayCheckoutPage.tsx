import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  createPaywayLink,
} from "../shared/services/payment.service";
import { getOrderById } from "../shared/services/order.service";
import type { Order } from "../shared/types/Order";
import {
  formatVariantLabel,
  getOrderItemUnitPrice,
} from "../shared/utils/productVariants";

function OrderSummary({ order }: { order: Order }) {
  return (
    <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
        Orden #{order.id.slice(0, 8)}
      </p>
      <h2 className="mt-1 text-xl font-black text-white">Resumen de compra</h2>

      <div className="mt-5 space-y-4">
        {order.items.map((item, index) => {
          const unitPrice = getOrderItemUnitPrice(item);
          const variantLabel = formatVariantLabel(item.variant);

          return (
            <article
              key={`${item.product.id}-${item.variant?.id ?? index}`}
              className="flex items-start justify-between gap-4 border-b border-white/10 pb-4"
            >
              <div className="min-w-0">
                <p className="break-words font-bold text-white">
                  {item.product.title}
                </p>
                {variantLabel && (
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {variantLabel}
                  </p>
                )}
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {item.quantity} x ${unitPrice.toLocaleString("es-AR")}
                </p>
              </div>
              <strong className="shrink-0">
                ${(unitPrice * item.quantity).toLocaleString("es-AR")}
              </strong>
            </article>
          );
        })}
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="font-semibold text-slate-300">Total a pagar</p>
        <strong className="mt-1 block text-3xl text-white">
          ${Number(order.total).toLocaleString("es-AR")}
        </strong>
      </div>
    </aside>
  );
}

function getLinkErrorMessage(error: unknown) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;

  if (status === 404) return "No encontramos la orden.";
  if (status === 400) {
    return "Esta orden ya no está pendiente de pago o no usa pago con tarjeta.";
  }

  return "No pudimos iniciar el pago, intentá de nuevo.";
}

function isRetryable(error: unknown) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;

  return status === undefined || status >= 500;
}

function PaywayCheckoutPage() {
  const navigate = useNavigate();
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        // El backend reutiliza el link vigente, por eso es seguro repetir la llamada.
        const [loadedOrder, link] = await Promise.all([
          getOrderById(orderId),
          createPaywayLink(orderId),
        ]);

        if (cancelled) return;

        setOrder(loadedOrder);
        // Redirección completa: el frontend nunca maneja datos de tarjeta.
        window.location.href = link.checkoutUrl;
      } catch (loadError) {
        if (cancelled) return;

        if (axios.isAxiosError(loadError) && loadError.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError(getLinkErrorMessage(loadError));
        setCanRetry(isRetryable(loadError));
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [orderId, attempt, navigate]);

  if (!orderId) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-red-900">
          No se encontró la orden
        </h1>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-red-900">
          No pudimos iniciar el pago
        </h1>
        <p className="mt-3 font-semibold text-red-700">{error}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {canRetry && (
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white"
            >
              Reintentar
            </button>
          )}
          <Link
            to="/profile/orders"
            className="rounded-xl bg-white px-5 py-3 font-bold text-slate-800"
          >
            Ver mis compras
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="m-0 text-3xl font-black text-slate-950">
          Pagá con tarjeta
        </h1>
        <p className="mt-3 font-semibold text-slate-600">
          Vas a completar los datos de tu tarjeta en un formulario seguro.
        </p>
        <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-center font-semibold text-slate-600">
          {isLoading ? "Preparando el pago..." : "Te estamos redirigiendo al pago seguro..."}
        </p>
      </div>

      {order && <OrderSummary order={order} />}
    </section>
  );
}

export default PaywayCheckoutPage;
