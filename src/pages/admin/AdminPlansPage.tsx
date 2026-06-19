import { useEffect, useState } from "react";
import { createPlan, getPlans, updatePlan } from "../../shared/services/plan.service";
import type { CreatePlanPayload, Plan } from "../../shared/types/Plan";

type PlanFormState = {
  name: string;
  commissionPercentage: string;
  isActive: boolean;
};

const emptyForm: PlanFormState = {
  name: "",
  commissionPercentage: "",
  isActive: true,
};

function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch {
        setError("No se pudieron cargar los planes.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPlans();
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, checked, type } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function buildPayload(): CreatePlanPayload | null {
    const name = form.name.trim();
    const commissionPercentage = Number(form.commissionPercentage);

    if (!name) {
      setError("El nombre del plan es obligatorio.");
      return null;
    }

    if (
      form.commissionPercentage.trim() === "" ||
      Number.isNaN(commissionPercentage) ||
      commissionPercentage < 0
    ) {
      setError("El porcentaje de comision debe ser un numero mayor o igual a 0.");
      return null;
    }

    return {
      name,
      commissionPercentage,
      isActive: form.isActive,
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const payload = buildPayload();

    if (!payload) {
      return;
    }

    setIsSaving(true);

    try {
      const createdPlan = await createPlan(payload);
      setPlans((currentPlans) => [...currentPlans, createdPlan]);
      setSuccess("Plan creado correctamente.");
      setForm(emptyForm);
    } catch {
      setError("No se pudo crear el plan.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePlan(plan: Plan) {
    setError("");
    setSuccess("");
    setUpdatingPlanId(plan.id);

    try {
      const updatedPlan = await updatePlan(plan.id, {
        isActive: !plan.isActive,
      });

      setPlans((currentPlans) =>
        currentPlans.map((currentPlan) =>
          currentPlan.id === plan.id ? updatedPlan : currentPlan
        )
      );
      setSuccess(
        updatedPlan.isActive
          ? "Plan activado correctamente."
          : "Plan desactivado correctamente."
      );
    } catch {
      setError("No se pudo actualizar el estado del plan.");
    } finally {
      setUpdatingPlanId(null);
    }
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Planes
        </h1>

        <p className="mt-2 text-slate-500">
          Crea planes comerciales con su porcentaje de comision.
        </p>
      </div>

      {(error || success) && (
        <div className="mb-6 space-y-3">
          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">
              {success}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <form
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8"
          onSubmit={handleSubmit}
        >
          <h2 className="m-0 text-xl font-black text-slate-950">
            Crear plan
          </h2>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">Nombre</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Ej: Premium"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-bold text-slate-700">
              Porcentaje de comision
            </span>
            <input
              name="commissionPercentage"
              type="number"
              min="0"
              step="0.01"
              value={form.commissionPercentage}
              onChange={handleChange}
              disabled={isSaving}
              placeholder="Ej: 10"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>

          <label className="flex items-center gap-3 font-bold text-slate-700">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              disabled={isSaving}
              className="h-5 w-5 rounded border-slate-300 text-blue-600"
            />
            Activo
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSaving ? "Guardando..." : "Guardar plan"}
          </button>
        </form>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          <div className="mb-5">
            <h2 className="m-0 text-xl font-black text-slate-950">
              Planes existentes
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Cambia un plan de activo a inactivo segun corresponda.
            </p>
          </div>

          {isLoading ? (
            <p className="text-slate-500">Cargando planes...</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-[560px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Comision</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Accion</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {plans.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-slate-500"
                      >
                        Todavia no hay planes creados.
                      </td>
                    </tr>
                  )}

                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        {plan.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {plan.commissionPercentage}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold ${
                            plan.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {plan.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleTogglePlan(plan)}
                          disabled={updatingPlanId === plan.id}
                          className={`rounded-xl px-4 py-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            plan.isActive
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                        >
                          {updatingPlanId === plan.id
                            ? "Actualizando..."
                            : plan.isActive
                              ? "Desactivar"
                              : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}

export default AdminPlansPage;
