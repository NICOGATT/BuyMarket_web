import { useEffect, useState } from "react";
import {
  getPaymentGateways,
  updatePaymentGateway,
} from "../../../shared/services/paymentGateway.service";
import type { PaymentGateway } from "../../../shared/types/PaymentGateway";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "../../../shared/utils/apiError";

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

/**
 * Lista de pasarelas con boton para activar/desactivar cada una. Se usa en el
 * dashboard y en la seccion "Pasarelas de pago" del panel admin. Renderiza lo
 * que devuelve GET /payment-gateways, sin hardcodear pasarelas.
 */
function PaymentGatewayToggleList() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingMethods, setUpdatingMethods] = useState<Set<string>>(
    () => new Set()
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

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
          : `${updatedGateway.name} desactivada. Los compradores ya no pueden elegirla en el checkout.`,
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

  if (isLoading) {
    return <p className="m-0 text-slate-500">Cargando pasarelas...</p>;
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="m-0 font-bold text-red-700">{loadError}</p>
        <button
          type="button"
          onClick={handleReload}
          className="mt-3 rounded-xl bg-red-700 px-4 py-2 font-bold text-white transition hover:bg-red-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (gateways.length === 0) {
    return <p className="m-0 text-slate-500">No hay pasarelas configuradas.</p>;
  }

  return (
    <div>
      <div aria-live="polite">
        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-bold ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>

      <ul className="m-0 list-none divide-y divide-slate-200 p-0">
        {gateways.map((gateway) => {
          const isUpdating = updatingMethods.has(gateway.method);

          return (
            <li
              key={gateway.method}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <p className="m-0 truncate text-lg font-black text-slate-950">
                  {gateway.name}
                </p>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                    gateway.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {gateway.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => void handleToggle(gateway)}
                disabled={isUpdating}
                aria-label={`${gateway.isActive ? "Desactivar" : "Activar"} ${gateway.name}`}
                className={`w-full shrink-0 rounded-xl px-4 py-2 font-bold transition disabled:cursor-wait disabled:opacity-60 sm:w-32 ${
                  gateway.isActive
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {isUpdating
                  ? "Guardando..."
                  : gateway.isActive
                    ? "Desactivar"
                    : "Activar"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PaymentGatewayToggleList;
