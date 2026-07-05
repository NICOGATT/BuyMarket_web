import { useEffect, useState } from "react";
import { ArrowLeft, Package, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getMySales } from "../shared/services/order.service";
import type { Sale } from "../shared/types/Order";
import { getUserFromToken } from "../shared/utils/auth";
import {
  formatVariantLabel,
  getSaleSubtotal,
} from "../shared/utils/productVariants";

const saleStatusLabels: Record<string, string> = {
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

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getBuyerName(sale: Sale) {
  const buyer = sale.buyer;

  if (!buyer) return "Comprador";

  return (
    [buyer.firstName, buyer.lastName]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(" ") ||
    buyer.name ||
    buyer.email ||
    "Comprador"
  );
}

function MySalesPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getUserFromToken()) {
      navigate("/login");
      return;
    }

    async function loadSales() {
      try {
        setError("");
        const data = await getMySales();
        setSales(data);
      } catch {
        setError("No se pudieron cargar tus ventas.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSales();
  }, [navigate]);

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
            Mis ventas
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
          Cargando ventas...
        </p>
      ) : sales.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-10 w-10 text-[var(--brand)]" />
          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Todavia no tenes ventas
          </h2>
          <Link
            to="/products/create"
            className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)]"
          >
            Publicar producto
          </Link>
        </section>
      ) : (
        <div className="grid gap-4">
          {sales.map((sale) => {
            const subtotal = getSaleSubtotal(sale);

            return (
              <article
                key={sale.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-500">
                      Venta #{sale.id.slice(0, 8)} - {formatDate(sale.createdAt)}
                    </p>
                    <h2 className="mt-2 flex items-center gap-2 text-xl font-black text-slate-950">
                      <Package className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                      <span className="truncate">
                        {sale.product?.title ?? "Producto vendido"}
                      </span>
                    </h2>
                    {formatVariantLabel(sale.variant) && (
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {formatVariantLabel(sale.variant)}
                      </p>
                    )}
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Comprador: {getBuyerName(sale)}
                    </p>
                  </div>

                  <strong className="text-2xl font-black text-[var(--brand)]">
                    ${subtotal.toLocaleString("es-AR")}
                  </strong>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
                    {saleStatusLabels[sale.status ?? ""] ?? sale.status ?? "Sin estado"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
                    Cantidad: {sale.quantity}
                  </span>
                  {sale.orderId && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">
                      Orden #{sale.orderId.slice(0, 8)}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MySalesPage;
