import { useEffect, useState } from "react";
import { CreditCard, Landmark, Star, Trash2, WalletCards } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserPaymentMethod,
  deleteUserPaymentMethod,
  getMyPaymentMethods,
  setDefaultUserPaymentMethod,
} from "../shared/services/userPaymentMethod.service";
import type {
  CreateUserPaymentMethodPayload,
  PaymentMethod,
  UserPaymentMethod,
} from "../shared/types/UserPaymentMethod";
import { getUserFromToken } from "../shared/utils/auth";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  mercado_pago: "Mercado Pago",
  transfer: "Transferencia",
  cash: "Efectivo",
};

const emptyForm: CreateUserPaymentMethodPayload = {
  method: "mercado_pago",
  label: "Mercado Pago",
  isDefault: false,
  senderAlias: "",
  senderCbu: "",
};

function getDefaultLabel(method: PaymentMethod) {
  return paymentMethodLabels[method] ?? "Medio de pago";
}

function buildPaymentMethodPayload(
  form: CreateUserPaymentMethodPayload
): CreateUserPaymentMethodPayload | string {
  const method = form.method;
  const label = form.label.trim() || getDefaultLabel(method);
  const senderAlias = form.senderAlias?.trim();
  const senderCbu = form.senderCbu?.trim();

  if (!label) return "Ingresa una etiqueta para el medio de pago.";

  const payload: CreateUserPaymentMethodPayload = {
    method,
    label,
    isDefault: Boolean(form.isDefault),
  };

  if (method === "transfer") {
    if (senderAlias) payload.senderAlias = senderAlias;
    if (senderCbu) payload.senderCbu = senderCbu;
  }

  return payload;
}

function getPaymentIcon(method: PaymentMethod) {
  if (method === "transfer") return <Landmark className="h-5 w-5" />;
  if (method === "cash") return <WalletCards className="h-5 w-5" />;
  return <CreditCard className="h-5 w-5" />;
}

function MyPaymentMethodsPage() {
  const navigate = useNavigate();
  const [user] = useState(() => getUserFromToken());
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([]);
  const [form, setForm] = useState<CreateUserPaymentMethodPayload>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadPaymentMethods() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getMyPaymentMethods();
        setPaymentMethods(
          data.filter((paymentMethod) => paymentMethod.isActive !== false)
        );
      } catch {
        setError("No se pudieron cargar tus medios de pago.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPaymentMethods();
  }, [navigate, user]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = event.target;
    const checked =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "method") {
        const method = value as PaymentMethod;
        next.label = getDefaultLabel(method);

        if (method !== "transfer") {
          next.senderAlias = "";
          next.senderCbu = "";
        }
      }

      return next;
    });
  }

  async function handleCreatePaymentMethod(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = buildPaymentMethodPayload(form);

    if (typeof payload === "string") {
      setError(payload);
      return;
    }

    try {
      setIsSaving(true);
      const createdPaymentMethod = await createUserPaymentMethod(payload);

      setPaymentMethods((prev) => {
        const activeMethods = prev.filter(
          (paymentMethod) => paymentMethod.id !== createdPaymentMethod.id
        );

        if (createdPaymentMethod.isDefault) {
          return activeMethods
            .map((paymentMethod) => ({
              ...paymentMethod,
              isDefault: false,
            }))
            .concat(createdPaymentMethod);
        }

        return activeMethods.concat(createdPaymentMethod);
      });
      setForm(emptyForm);
      setSuccess("Medio de pago guardado.");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo guardar el medio de pago."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSetDefault(id: string) {
    setError("");
    setSuccess("");

    try {
      const updatedPaymentMethod = await setDefaultUserPaymentMethod(id);

      setPaymentMethods((prev) =>
        prev.map((paymentMethod) => ({
          ...paymentMethod,
          isDefault: paymentMethod.id === updatedPaymentMethod.id,
        }))
      );
    } catch (defaultError) {
      setError(
        defaultError instanceof Error
          ? defaultError.message
          : "No se pudo marcar como predeterminado."
      );
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSuccess("");

    try {
      await deleteUserPaymentMethod(id);
      setPaymentMethods((prev) =>
        prev.filter((paymentMethod) => paymentMethod.id !== id)
      );
      setSuccess("Medio de pago eliminado.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el medio de pago."
      );
    }
  }

  if (!user) return null;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-[var(--brand)]">
            Cuenta
          </p>
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Medios de pago
          </h1>
          <p className="mt-2 max-w-2xl font-semibold text-slate-500">
            Guardá opciones para elegirlas más rápido al finalizar una compra.
          </p>
        </div>

        <Link
          to="/profile"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-700 transition hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
        >
          Volver al perfil
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            <h2 className="m-0 text-xl font-black text-slate-950">
              Tus medios guardados
            </h2>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 font-semibold text-green-700">
              {success}
            </p>
          )}

          {isLoading ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
              Cargando medios de pago...
            </p>
          ) : paymentMethods.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
              Todavía no tenés medios de pago guardados.
            </p>
          ) : (
            <div className="mt-5 grid gap-3">
              {paymentMethods.map((paymentMethod) => (
                <article
                  key={paymentMethod.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                        {getPaymentIcon(paymentMethod.method)}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="m-0 text-lg font-black text-slate-950">
                            {paymentMethod.label}
                          </h3>
                          {paymentMethod.isDefault && (
                            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-black uppercase text-[var(--brand-hover)]">
                              Predeterminado
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-semibold text-slate-700">
                          {paymentMethodLabels[paymentMethod.method]}
                        </p>
                        {paymentMethod.method === "transfer" &&
                          (paymentMethod.senderAlias || paymentMethod.senderCbu) && (
                            <p className="mt-1 text-sm font-semibold text-slate-500">
                              {paymentMethod.senderAlias
                                ? `Alias: ${paymentMethod.senderAlias}`
                                : ""}
                              {paymentMethod.senderAlias && paymentMethod.senderCbu
                                ? " - "
                                : ""}
                              {paymentMethod.senderCbu
                                ? `CBU: ${paymentMethod.senderCbu}`
                                : ""}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!paymentMethod.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(paymentMethod.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
                          aria-label="Marcar como predeterminado"
                        >
                          <Star size={18} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(paymentMethod.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-white text-red-600 transition hover:bg-red-50"
                        aria-label="Eliminar medio de pago"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <form
          onSubmit={handleCreatePaymentMethod}
          className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="m-0 text-xl font-black text-slate-950">
            Agregar medio
          </h2>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-2 block font-bold text-slate-700">
                Tipo
              </span>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[var(--brand)]"
              >
                <option value="mercado_pago">Mercado Pago</option>
                <option value="transfer">Transferencia</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block font-bold text-slate-700">
                Etiqueta
              </span>
              <input
                name="label"
                value={form.label}
                onChange={handleChange}
                placeholder="Ej: Banco Nación"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
            </label>

            {form.method === "transfer" && (
              <>
                <label className="block">
                  <span className="mb-2 block font-bold text-slate-700">
                    Alias origen
                  </span>
                  <input
                    name="senderAlias"
                    value={form.senderAlias ?? ""}
                    onChange={handleChange}
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block font-bold text-slate-700">
                    CBU origen
                  </span>
                  <input
                    name="senderCbu"
                    value={form.senderCbu ?? ""}
                    onChange={handleChange}
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
                  />
                </label>
              </>
            )}

            <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 font-bold text-slate-700">
              <input
                name="isDefault"
                type="checkbox"
                checked={Boolean(form.isDefault)}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Usar como predeterminado
            </label>
          </div>

          <button
            disabled={isSaving}
            className="mt-4 w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8]"
          >
            {isSaving ? "Guardando..." : "Guardar medio de pago"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default MyPaymentMethodsPage;
