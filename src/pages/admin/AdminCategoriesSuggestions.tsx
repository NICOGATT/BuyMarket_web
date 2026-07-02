import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import {
  approveCategorySuggestion,
  getPendingCategorySuggestions,
  rejectCategorySuggestion,
} from "../../shared/services/categorySuggestion.service";
import type { CategorySuggestion } from "../../shared/types/CategorySuggestion";

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getUserName(suggestion: CategorySuggestion) {
  const user = suggestion.user;

  if (!user) return "Usuario no informado";

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.name || user.email || "Usuario no informado";
}

function AdminCategorySuggestionsPage() {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSuggestions() {
    try {
      setError("");
      const data = await getPendingCategorySuggestions();
      setSuggestions(data);
    } catch {
      setError("No se pudieron cargar las sugerencias de categorías.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSuggestions();
  }, []);

  async function handleApprove(suggestion: CategorySuggestion) {
    try {
      setProcessingId(suggestion.id);
      setError("");
      setMessage("");
      await approveCategorySuggestion(suggestion.id);
      setSuggestions((current) =>
        current.filter((item) => item.id !== suggestion.id)
      );
      setMessage(`Categoría "${suggestion.name}" aceptada correctamente.`);
    } catch {
      setError("No se pudo aceptar la sugerencia.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(suggestion: CategorySuggestion) {
    try {
      setProcessingId(suggestion.id);
      setError("");
      setMessage("");
      await rejectCategorySuggestion(suggestion.id);
      setSuggestions((current) =>
        current.filter((item) => item.id !== suggestion.id)
      );
      setMessage(`Sugerencia "${suggestion.name}" rechazada.`);
    } catch {
      setError("No se pudo rechazar la sugerencia.");
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Cargando sugerencias...</p>;
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Sugerencias de categorías
        </h1>

        <p className="mt-2 text-slate-500">
          Revisá las categorías propuestas por usuarios antes de sumarlas al
          catálogo.
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </p>
      )}

      {suggestions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="m-0 text-2xl font-black text-slate-950">
            No hay sugerencias pendientes
          </h2>
          <p className="mt-2 font-semibold text-slate-500">
            Cuando un usuario proponga una categoría nueva, va a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {suggestions.map((suggestion) => {
            const isProcessing = processingId === suggestion.id;

            return (
              <article
                key={suggestion.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase text-[var(--brand)]">
                      {formatDate(suggestion.createdAt)}
                    </p>
                    <h2 className="m-0 mt-2 break-words text-xl font-black text-slate-950">
                      {suggestion.name}
                    </h2>
                    <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                      {suggestion.description || "Sin descripción."}
                    </p>
                    <p className="mt-3 text-sm font-bold text-slate-600">
                      Sugerida por {getUserName(suggestion)}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                    Pendiente
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void handleApprove(suggestion)}
                    disabled={Boolean(processingId)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check size={18} />
                    {isProcessing ? "Procesando..." : "Aceptar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleReject(suggestion)}
                    disabled={Boolean(processingId)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={18} />
                    Rechazar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminCategorySuggestionsPage;
