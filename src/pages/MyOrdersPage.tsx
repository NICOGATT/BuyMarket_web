import { useEffect, useState } from "react";
import { ArrowLeft, Package, ShoppingBag, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getMyOrders } from "../shared/services/order.service";
import { createMercadoPagoPreference } from "../shared/services/payment.service";
import type { Order } from "../shared/types/Order";
import { getUserFromToken } from "../shared/utils/auth";
import {
  formatVariantLabel,
  getOrderItemUnitPrice,
} from "../shared/utils/productVariants";

const paymentMethodLabels: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  mercado_pago: "Mercado Pago",
  payway: "Tarjeta de crédito/débito",
  getnet_qr: "Pago con QR",
};

const orderStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  delivered: "Entregada",
  cancelled: "Cancelada",
  rejected: "Rechazada",
  accepted: "Aceptada",
  preparing: "Preparando",
  on_the_way: "En camino",
  review: "En revision",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pago pendiente",
  COMPLETED: "Pago aprobado",
  REJECTED: "Pago rechazado",
  approved: "Pago aprobado",
  rejected: "Pago rechazado",
  pending: "Pago pendiente",
};

const paymentStatusClasses: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getOrderPaymentStatus(order: Order) {
  if (order.payment?.status) return order.payment.status;
  if (order.paymentStatus) return order.paymentStatus;
  if (order.status === "paid" || order.status === "delivered") return "COMPLETED";
  if (order.status === "rejected" || order.status === "cancelled") return "REJECTED";
  return "PENDING";
}

// Medios que se pueden retomar desde el checkout. Transferencia y efectivo son manuales.
const resumablePaymentRoutes: Record<string, (orderId: string) => string> = {
  payway: (orderId) => "/checkout/payway/" + orderId,
  getnet_qr: (orderId) => "/checkout/getnet-qr/" + orderId,
};

function canPayOrder(order: Order, paymentStatus: string) {
  const method = order.paymentMethod ?? "";

  return (
    order.status === "pending" &&
    (paymentStatus === "PENDING" || paymentStatus === "pending") &&
    (method === "mercado_pago" || method in resumablePaymentRoutes)
  );
}

function getOrderShipment(order: Order) {
  return order.shipment ?? order.shipments?.[0] ?? null;
}

function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingOrderId, setPayingOrderId] = useState("");

  useEffect(() => {
    if (!getUserFromToken()) {
      navigate("/login");
      return;
    }

    async function loadOrders() {
      try {
        setError("");
        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setError("No se pudieron cargar tus compras.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [navigate]);

  async function handlePayOrder(order: Order) {
    const method = order.paymentMethod ?? "";
    const route = resumablePaymentRoutes[method];

    if (route) {
      navigate(route(order.id));
      return;
    }

    try {
      setPayingOrderId(order.id);
      setError("");
      const preference = await createMercadoPagoPreference(order.id);
      const redirectUrl = import.meta.env.DEV
        ? preference.sandboxInitPoint ?? preference.initPoint
        : preference.initPoint ?? preference.sandboxInitPoint;

      if (!redirectUrl) throw new Error("Missing payment link");

      window.location.assign(redirectUrl);
    } catch {
      setError("No se pudo abrir el pago. Intentalo nuevamente.");
      setPayingOrderId("");
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[var(--brand)]"
          >
            <ArrowLeft size={16} />
            Volver al perfil
          </Link>
          <p className="mt-4 text-sm font-black uppercase text-[var(--brand)]">
            Cuenta
          </p>
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Mis compras
          </h1>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="rounded-2xl bg-white p-6 font-semibold text-slate-500 shadow-sm">
          Cargando compras...
        </p>
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-10 w-10 text-[var(--brand)]" />
          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Todavia no realizaste compras
          </h2>
          <Link
            to="/products"
            className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)]"
          >
            Ver productos
          </Link>
        </section>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const paymentStatus = getOrderPaymentStatus(order);
            const firstItem = order.items?.[0];
            const extraItems = Math.max((order.items?.length ?? 0) - 1, 0);
            const shipment = getOrderShipment(order);

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-500">
                      Orden #{order.id.slice(0, 8)} - {formatDate(order.createdAt)}
                    </p>
                    <h2 className="mt-2 flex items-center gap-2 text-xl font-black text-slate-950">
                      <Package className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                      <span className="truncate">
                        {firstItem?.product?.title ?? "Compra en BuyMarket"}
                        {extraItems > 0 ? ` +${extraItems} mas` : ""}
                      </span>
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {paymentMethodLabels[order.paymentMethod ?? ""] ??
                        order.paymentMethod ??
                        "Sin metodo de pago"}
                    </p>
                  </div>

                  <strong className="text-2xl font-black text-[var(--brand)]">
                    ${Number(order.total).toLocaleString("es-AR")}
                  </strong>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!["paid", "pending"].includes(order.status) && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
                      {orderStatusLabels[order.status] ?? order.status}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-black ${
                      paymentStatusClasses[paymentStatus] ??
                      "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {paymentStatusLabels[paymentStatus] ?? paymentStatus}
                  </span>
                  {canPayOrder(order, paymentStatus) && (
                    <button
                      type="button"
                      onClick={() => handlePayOrder(order)}
                      disabled={payingOrderId === order.id}
                      className="rounded-full bg-[var(--brand)] px-4 py-1 text-sm font-black text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {payingOrderId === order.id ? "Abriendo..." : "Ir a pagar"}
                    </button>
                  )}
                  {shipment && (
                    <Link
                      to="/profile/shipments"
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--nav-blue)] px-3 py-1 text-sm font-black text-white transition hover:bg-[var(--nav-blue-hover)]"
                    >
                      <Truck className="h-4 w-4" aria-hidden="true" />
                      Ver envío
                    </Link>
                  )}
                </div>

                {order.items?.length > 0 && (
                  <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.product?.id ?? "item"}-${item.variant?.id ?? index}`}
                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {item.product?.title ?? "Producto"}
                          </p>
                          {formatVariantLabel(item.variant) && (
                            <p className="text-sm font-semibold text-slate-500">
                              {formatVariantLabel(item.variant)}
                            </p>
                          )}
                        </div>
                        <p className="font-black text-slate-700">
                          x{item.quantity} - $
                          {(
                            getOrderItemUnitPrice(item) * item.quantity
                          ).toLocaleString("es-AR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyOrdersPage;
