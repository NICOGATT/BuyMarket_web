import { useEffect, useState } from "react";
import {
  getPaymentGateways,
  updatePaymentGateway,
} from "../../shared/services/paymentGateway.service";
import type { PaymentGateway } from "../../shared/types/PaymentGateway";
import { getApiErrorMessage, getApiErrorStatus } from "../../shared/utils/apiError";

type Feedback = {
  type: "success" | "error";
  message: string;
};

function getToggleErrorMessage(error: unknown, gateway: PaymentGateway) {
  const status = getApiErrorStatus(error);

  if (status === 401) return "Tu sesión expiró. Volvé a iniciar sesión.";
  if (status === 403) return "No tenés permisos para modificar las pasarelas de pago.";
  if (status === 404) {
    return `La pasarela ${gateway.name} ya no existe. Recargá la lista.`;
  }

  const fallback = `No se pudo actualizar ${gateway.name}. Intentá de nuevo.`;

  // Solo los 4xx traen un mensaje pensado para mostrar.
  return status && status < 500 ? getApiErrorMessage(error, fallback) : fallback;
}

function setGatewayActive(
  gateways: PaymentGateway[],
  method: string,
  isActive: boolean
) {
  return gateways.map((gateway) =>
    gateway.method === method ? { ...gateway, isActive } : gateway
  );
}

function AdminPaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingMethods, setUpdatingMethods] = useState<Set<string>>(
    () => new Set()
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadGateways() {
      try {
        const data = await getPaymentGateways();
        if (cancelled) return;
        setGateways(data);
        setLoadError("");
      } catch {
        if (!cancelled) {
          setLoadError("No se pudieron cargar las pasarelas de pago.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadGateways();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function handleReload() {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }

  function setUpdating(method: string, isUpdating: boolean) {
    setUpdatingMethods((current) => {
      const next = new Set(current);

      if (isUpdating) {
        next.add(method);
      } else {
        next.delete(method);
      }

      return next;
    });
  }

  async function handleToggle(gateway: PaymentGateway) {
    const nextIsActive = !gateway.isActive;

    if (
      !nextIsActive &&
      !window.confirm(
        `Los compradores ya no podrán pagar con ${gateway.name}. ¿Continuar?`
      )
    ) {
      return;
    }

    setFeedback(null);
    setUpdating(gateway.method, true);
    // Actualizacion optimista: si el backend falla, volvemos al estado anterior.
    setGateways((current) =>
      setGatewayActive(current, gateway.method, nextIsActive)
    );

    try {
      const updatedGateway = await updatePaymentGateway(
        gateway.method,
        nextIsActive
      );

      setGateways((current) =>
        current.map((item) =>
          item.method === updatedGateway.method
            ? { ...item, ...updatedGateway }
            : item
        )
      );
      setFeedback({
        type: "success",
        message: updatedGateway.isActive
          ? `${updatedGateway.name} activada. Los compradores ya pueden usarla.`
          : `${updatedGateway.name} desactivada. Ya no aparece como opción de pago.`,
      });
    } catch (error) {
      setGateways((current) =>
        setGatewayActive(current, gateway.method, gateway.isActive)
      );
      setFeedback({
        type: "error",
        message: getToggleErrorMessage(error, gateway),
      });
    } finally {
      setUpdating(gateway.method, false);
    }
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Pasarelas de pago
        </h1>

        <p className="mt-2 text-slate-500">
          Activá o desactivá los medios de pago online. Transferencia y
          efectivo siempre están disponibles.
        </p>
      </div>

      <div aria-live="polite">
        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mb-6 rounded-2xl border px-4 py-3 font-bold ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
        {isLoading ? (
          <p className="text-slate-500">Cargando pasarelas...</p>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-bold text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={handleReload}
              className="mt-3 rounded-xl bg-red-700 px-4 py-2 font-bold text-white transition hover:bg-red-800"
            >
              Reintentar
            </button>
          </div>
        ) : gateways.length === 0 ? (
          <p className="text-slate-500">No hay pasarelas configuradas.</p>
        ) : (
          <ul className="m-0 list-none divide-y divide-slate-200 p-0">
            {gateways.map((gateway) => {
              const isUpdating = updatingMethods.has(gateway.method);

              return (
                <li
                  key={gateway.method}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="m-0 text-lg font-black text-slate-950">
                      {gateway.name}
                    </p>
                    <p className="m-0 mt-1 font-mono text-xs text-slate-400">
                      {gateway.method}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        gateway.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isUpdating
                        ? "Guardando..."
                        : gateway.isActive
                          ? "Activa"
                          : "Inactiva"}
                    </span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={gateway.isActive}
                      aria-label={`${gateway.isActive ? "Desactivar" : "Activar"} ${gateway.name}`}
                      onClick={() => void handleToggle(gateway)}
                      disabled={isUpdating}
                      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
                        gateway.isActive ? "bg-green-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                          gateway.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </section>
  );
}

export default AdminPaymentGatewaysPage;
