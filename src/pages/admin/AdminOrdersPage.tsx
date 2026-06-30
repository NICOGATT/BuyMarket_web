import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../shared/services/api";
import { getAdminOrders } from "../../shared/services/order.service";
import { approveTransferPayment } from "../../shared/services/payment.service";
import type { Order } from "../../shared/types/Order";

const paymentMethodLabels: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  mercado_pago: "Mercado Pago",
};

function toPublicFileUrl(value?: string) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  return `${API_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function getTransferProofUrl(order: Order) {
  const payment = order.payment;
  const proofUrl =
    payment?.proofUrl ??
    payment?.proofImageUrl ??
    payment?.proofFileUrl ??
    payment?.transferProofUrl ??
    payment?.receiptUrl ??
    payment?.proof?.url ??
    payment?.proof?.fileUrl ??
    payment?.proof?.imageUrl;

  return toPublicFileUrl(proofUrl);
}

function hasShipment(order: Order) {
  return Boolean(order.shipment || order.shipments?.length);
}

function canCreateShipment(order: Order) {
  const paymentStatus = order.payment?.status ?? order.paymentStatus;

  return (
    !hasShipment(order) &&
    (order.status === "paid" ||
      order.status === "accepted" ||
      order.status === "preparing" ||
      paymentStatus === "COMPLETED")
  );
}

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await getAdminOrders();
        setOrders(data);
      } catch {
        setError("No se pudieron cargar las ordenes.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  async function handleApproveTransfer(orderId: string) {
    try {
      setApprovingOrderId(orderId);
      setError("");
      const result = await approveTransferPayment(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: result.orderStatus ?? "paid" }
            : order
        )
      );
    } catch {
      setError("No se pudo aprobar la transferencia.");
    } finally {
      setApprovingOrderId(null);
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Cargando ordenes...</p>;
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-950">Ordenes</h1>

        <p className="mt-2 text-slate-500">
          Revisa pedidos, estados e incidencias dentro de BuyMarket.
        </p>
      </div>

      {error && (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-900">
            No hay ordenes todavia
          </h2>

          <p className="mt-2 text-slate-500">
            Cuando los usuarios realicen compras, apareceran aca.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Orden</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Pago</th>
                <th className="px-6 py-4">Comprobante</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => {
                const transferProofUrl = getTransferProofUrl(order);

                return (
                  <tr key={order.id}>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      #{order.id.slice(0, 8)}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {order.buyer?.email ?? "Sin comprador"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {order.items?.length ?? 0}
                    </td>

                    <td className="px-6 py-4 font-bold text-[var(--brand)]">
                      ${order.total.toLocaleString("es-AR")}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {order.paymentMethod
                        ? paymentMethodLabels[order.paymentMethod] ??
                          order.paymentMethod
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      {order.paymentMethod === "transfer" && transferProofUrl ? (
                        <a
                          href={transferProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-[var(--brand)] transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)]"
                        >
                          <img
                            src={transferProofUrl}
                            alt="Comprobante de transferencia"
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          Ver comprobante
                        </a>
                      ) : order.paymentMethod === "transfer" ? (
                        <span className="text-sm font-semibold text-amber-600">
                          Sin comprobante
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">
                          -
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-bold text-[var(--brand-hover)]">
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("es-AR")
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      {order.paymentMethod === "transfer" &&
                      order.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => handleApproveTransfer(order.id)}
                          disabled={approvingOrderId === order.id}
                          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                        >
                          {approvingOrderId === order.id
                            ? "Aprobando..."
                          : "Aprobar transferencia"}
                        </button>
                      ) : canCreateShipment(order) ? (
                        <Link
                          to="/admin/shipments"
                          className="inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)]"
                        >
                          Crear envio
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminOrdersPage;
