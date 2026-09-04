import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createGetnetOrder,
  type GetnetCheckoutResponse,
} from "../shared/services/payment.service";
import { getOrderById } from "../shared/services/order.service";
import type { Order } from "../shared/types/Order";
import {
  formatVariantLabel,
  getOrderItemUnitPrice,
} from "../shared/utils/productVariants";

declare global {
  interface Window {
    loader?: {
      init: (config: {
        paymentIntentId: string;
        checkoutType: "iframe" | "lightbox";
      }) => void;
    };
  }
}

const digitalCheckoutScriptId = "digital-checkout";

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

function GetnetCheckoutPage() {
  const { orderId = "" } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [checkout, setCheckout] = useState<GetnetCheckoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [error, setError] = useState("");
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function load() {
      try {
        const [loadedOrder, checkoutResult] = await Promise.all([
          getOrderById(orderId),
          createGetnetOrder(orderId),
        ]);

        if (cancelled) return;

        setOrder(loadedOrder);
        setCheckout(checkoutResult);
      } catch {
        if (!cancelled) {
          setError("No se pudo iniciar el pago con Getnet. Intentalo nuevamente.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Flujo redirect: Getnet no devolvió modalidad iframe, se envía al hosted checkout.
  useEffect(() => {
    if (checkout?.checkoutType === "redirect" && checkout.checkoutUrl) {
      window.location.href = checkout.checkoutUrl;
    }
  }, [checkout]);

  // Flujo iframe: carga digital-checkout/loader.js y monta el widget en nuestro contenedor.
  useEffect(() => {
    if (
      checkout?.checkoutType !== "iframe" ||
      !checkout.loaderUrl ||
      widgetInitialized.current
    ) {
      return;
    }

    widgetInitialized.current = true;

    function mountWidget() {
      window.loader?.init({
        paymentIntentId: checkout!.paymentIntentId,
        checkoutType: "iframe",
      });

      window.requestAnimationFrame(() => {
        const iframe = document.querySelector("iframe");
        if (iframe && iframeContainerRef.current) {
          iframeContainerRef.current.appendChild(iframe);
          iframe.style.width = "100%";
          iframe.style.minHeight = "640px";
          iframe.style.border = "0";
        }
        setIsWidgetReady(true);
      });
    }

    if (window.loader?.init) {
      mountWidget();
      return;
    }

    const existingScript = document.getElementById(
      digitalCheckoutScriptId
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", mountWidget, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = checkout.loaderUrl;
    script.async = true;
    script.id = digitalCheckoutScriptId;
    script.setAttribute("data-testid", digitalCheckoutScriptId);
    script.addEventListener("load", mountWidget, { once: true });
    script.addEventListener("error", () => {
      setError("No se pudo cargar el checkout de Getnet.");
    });
    document.body.appendChild(script);
  }, [checkout]);

  // El estado final lo confirma el webhook del backend; el frontend solo consulta la orden.
  useEffect(() => {
    if (!orderId || order?.status === "paid" || order?.status === "rejected") {
      return;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void getOrderById(orderId).then(setOrder).catch(() => undefined);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [orderId, order?.status]);

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

  if (isLoading) {
    return <p className="text-slate-500">Preparando el pago con Getnet...</p>;
  }

  if (!order || (error && !checkout)) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-red-900">
          No pudimos cargar la orden
        </h1>
        <p className="mt-3 font-semibold text-red-700">
          {error || "Volvé a Mis compras para revisar el estado del pedido."}
        </p>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
      </section>
    );
  }

  if (order.status === "paid") {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-green-900">
          Pago aprobado
        </h1>
        <p className="mt-3 font-semibold text-green-700">
          Confirmamos el pago de la orden #{order.id.slice(0, 8)}.
        </p>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
      </section>
    );
  }

  if (order.status === "rejected") {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-red-900">
          Pago rechazado
        </h1>
        <p className="mt-3 font-semibold text-red-700">
          No pudimos aprobar el pago de esta orden.
        </p>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
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
          Completá los datos de tu tarjeta en el formulario seguro de Getnet.
        </p>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
            {error}
          </p>
        )}

        {checkout?.checkoutType === "redirect" ? (
          <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-center font-semibold text-slate-600">
            Te estamos redirigiendo al checkout seguro de Getnet...
          </p>
        ) : (
          <>
            {!isWidgetReady && (
              <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-center font-semibold text-slate-600">
                Cargando formulario de pago...
              </p>
            )}
            <div
              ref={iframeContainerRef}
              className="mt-6 overflow-hidden rounded-2xl border border-slate-200"
            />
            <p className="mt-5 text-center text-sm font-semibold text-slate-500">
              Esperando la confirmación segura de Getnet...
            </p>
          </>
        )}
      </div>

      <OrderSummary order={order} />
    </section>
  );
}

export default GetnetCheckoutPage;
