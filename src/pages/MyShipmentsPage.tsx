import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Package,
  Route,
  Truck,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getMyShipments } from "../shared/services/shipment.service";
import type { Shipment } from "../shared/types/Shipment";
import { getUserFromToken } from "../shared/utils/auth";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  assigned: "Repartidor asignado",
  picked_up: "Retirado",
  in_transit: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-[var(--nav-blue-soft)] text-[var(--nav-blue)]",
  picked_up: "bg-indigo-100 text-indigo-700",
  in_transit: "bg-[var(--brand-soft)] text-[var(--brand-hover)]",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const typeLabels: Record<string, string> = {
  local_delivery: "Envío local",
  national_shipping: "Envío nacional",
};

const carrierLabels: Record<string, string> = {
  buymarket: "BuyMarket",
  andreani: "Andreani",
  correo_argentino: "Correo Argentino",
  oca: "OCA",
};

const timelineSteps = [
  { key: "pending", label: "Pendiente" },
  { key: "assigned", label: "Asignado" },
  { key: "picked_up", label: "Retirado" },
  { key: "in_transit", label: "En camino" },
  { key: "delivered", label: "Entregado" },
];

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getShipmentOrderId(shipment: Shipment) {
  return shipment.orderId ?? shipment.order?.id ?? "";
}

function getShipmentProductTitle(shipment: Shipment) {
  const firstItem = shipment.order?.items?.[0];
  const extraItems = Math.max((shipment.order?.items?.length ?? 0) - 1, 0);

  if (!firstItem?.product?.title) return "Compra en BuyMarket";

  return `${firstItem.product.title}${extraItems > 0 ? ` +${extraItems} más` : ""}`;
}

function getDriverLabel(shipment: Shipment) {
  const driver = shipment.driver;
  const fullName = [driver?.firstName, driver?.lastName].filter(Boolean).join(" ");

  return fullName || driver?.name || driver?.email || shipment.driverId || "Sin asignar";
}

function getStepState(status: string, stepKey: string) {
  if (status === "cancelled") return "cancelled";

  const currentIndex = timelineSteps.findIndex((step) => step.key === status);
  const stepIndex = timelineSteps.findIndex((step) => step.key === stepKey);

  if (currentIndex === -1) return stepIndex === 0 ? "current" : "pending";
  if (stepIndex < currentIndex) return "done";
  if (stepIndex === currentIndex) return "current";

  return "pending";
}

function MyShipmentsPage() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getUserFromToken()) {
      navigate("/login");
      return;
    }

    async function loadShipments() {
      try {
        setError("");
        const data = await getMyShipments();
        setShipments(data);
      } catch {
        setError("No se pudieron cargar tus envíos.");
      } finally {
        setIsLoading(false);
      }
    }

    loadShipments();
  }, [navigate]);

  return (
    <section className="mx-auto max-w-6xl space-y-6">
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
            Seguimiento
          </p>
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Mis envíos
          </h1>
          <p className="mt-2 max-w-2xl font-semibold text-slate-500">
            Seguí el estado de las compras que ya tienen envío asignado.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="rounded-2xl bg-white p-6 font-semibold text-slate-500 shadow-sm">
          Cargando envíos...
        </p>
      ) : shipments.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <Truck className="mx-auto h-11 w-11 text-[var(--brand)]" />
          <h2 className="mt-4 text-2xl font-black text-slate-950">
            Todavía no tenés envíos
          </h2>
          <p className="mx-auto mt-2 max-w-lg font-semibold text-slate-500">
            Cuando una compra aceptada tenga un envío creado, vas a poder seguirlo
            desde acá.
          </p>
          <Link
            to="/profile/orders"
            className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)]"
          >
            Ver mis compras
          </Link>
        </section>
      ) : (
        <div className="grid gap-5">
          {shipments.map((shipment) => {
            const status = shipment.status ?? "pending";
            const orderId = getShipmentOrderId(shipment);

            return (
              <article
                key={shipment.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-500">
                      Orden #{orderId.slice(0, 8) || "-"} · {formatDate(shipment.createdAt)}
                    </p>
                    <h2 className="mt-2 flex items-center gap-2 text-xl font-black text-slate-950">
                      <Package className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                      <span className="truncate">{getShipmentProductTitle(shipment)}</span>
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {typeLabels[shipment.type ?? ""] ?? shipment.type ?? "Envío"} ·{" "}
                      {carrierLabels[shipment.carrier ?? ""] ??
                        shipment.carrier ??
                        "Transportista pendiente"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-black ${
                      statusClasses[status] ?? "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {statusLabels[status] ?? status}
                  </span>
                </div>

                <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-500">
                          <UserRound className="h-4 w-4" aria-hidden="true" />
                          Repartidor
                        </div>
                        <p className="mt-2 font-black text-slate-950">
                          {getDriverLabel(shipment)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-500">
                          <Route className="h-4 w-4" aria-hidden="true" />
                          Tracking
                        </div>
                        <p className="mt-2 font-black text-slate-950">
                          {shipment.trackingNumber ?? "Sin código todavía"}
                        </p>
                        {shipment.trackingUrl && (
                          <a
                            href={shipment.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-sm font-black text-[var(--brand)] hover:underline"
                          >
                            Abrir seguimiento
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-black uppercase text-slate-500">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        Dirección de entrega
                      </div>
                      <p className="mt-2 font-semibold text-slate-700">
                        {shipment.deliveryAddress ?? "Sin dirección informada"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-4 text-sm font-black uppercase text-slate-500">
                      Progreso
                    </p>
                    <ol className="space-y-3">
                      {timelineSteps.map((step) => {
                        const stepState = getStepState(status, step.key);
                        const isActive = stepState === "current";
                        const isDone = stepState === "done";

                        return (
                          <li key={step.key} className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                                isDone
                                  ? "border-green-500 bg-green-500 text-white"
                                  : isActive
                                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                    : "border-slate-300 bg-white text-slate-300"
                              }`}
                            >
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span
                              className={`font-bold ${
                                isDone || isActive ? "text-slate-950" : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyShipmentsPage;
