import { useEffect, useState } from "react";
import {
  getAdminWithdrawals,
  updateWithdrawalStatus,
} from "../../shared/services/wallet.service";
import type { Withdrawal } from "../../shared/types/Wallet";

const withdrawalStatusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  paid: "Pagado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

const withdrawalStatusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-[var(--brand-soft)] text-[var(--brand-hover)]",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-slate-600",
};

function formatMoney(value?: number) {
  return Number(value ?? 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
}

function formatDate(value?: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("es-AR");
}

function getWithdrawalUser(withdrawal: Withdrawal) {
  return withdrawal.wallet?.user;
}

function getUserDisplayName(withdrawal: Withdrawal) {
  const user = getWithdrawalUser(withdrawal);
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return fullName || user?.name || user?.email || "Sin nombre";
}

function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadWithdrawals() {
    try {
      setError("");
      const data = await getAdminWithdrawals();
      setWithdrawals(data);
    } catch {
      setError("No se pudieron cargar las solicitudes de retiro.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadWithdrawals);
  }, []);

  async function handleUpdateStatus(
    withdrawal: Withdrawal,
    status: "paid" | "rejected"
  ) {
    try {
      setProcessingId(withdrawal.id);
      setError("");
      setSuccess("");
      const updatedWithdrawal = await updateWithdrawalStatus(withdrawal.id, {
        status,
        adminNote: notes[withdrawal.id]?.trim() || undefined,
      });

      setWithdrawals((prev) =>
        prev.map((item) =>
          item.id === withdrawal.id
            ? {
                ...item,
                ...updatedWithdrawal,
                wallet: updatedWithdrawal.wallet
                  ? {
                      ...item.wallet,
                      ...updatedWithdrawal.wallet,
                      user: updatedWithdrawal.wallet.user ?? item.wallet?.user,
                    }
                  : item.wallet,
              }
            : item
        )
      );
      setSuccess(
        status === "paid"
          ? "Retiro marcado como pagado."
          : "Retiro rechazado correctamente."
      );
    } catch {
      setError("No se pudo actualizar la solicitud de retiro.");
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Cargando retiros...</p>;
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="m-0 text-4xl font-black text-slate-950">Retiros</h1>
        <p className="mt-2 text-slate-500">
          Gestiona solicitudes de retiro de saldo de los vendedores.
        </p>
      </div>

      {error && (
        <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 font-semibold text-green-700">
          {success}
        </p>
      )}

      {withdrawals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-900">
            No hay solicitudes de retiro
          </h2>
          <p className="mt-2 text-slate-500">
            Cuando un usuario solicite retirar dinero, aparecera aca.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Monto</th>
                <th className="px-5 py-4">Destino</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Nota admin</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {withdrawals.map((withdrawal) => {
                const user = getWithdrawalUser(withdrawal);
                const isPending = (withdrawal.status ?? "pending") === "pending";

                return (
                  <tr key={withdrawal.id}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-950">
                        {getUserDisplayName(withdrawal)}
                      </p>
                      <p className="text-sm font-semibold text-slate-500">
                        {user?.email ?? "Sin email"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-black text-[var(--brand)]">
                      {formatMoney(withdrawal.amount)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <p>Alias: {withdrawal.alias ?? "-"}</p>
                      <p>CBU: {withdrawal.cbu ?? "-"}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-black uppercase ${
                          withdrawalStatusClasses[withdrawal.status ?? "pending"] ??
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {withdrawalStatusLabels[withdrawal.status ?? "pending"] ??
                          withdrawal.status ??
                          "Pendiente"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(withdrawal.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      {isPending ? (
                        <input
                          value={notes[withdrawal.id] ?? ""}
                          onChange={(event) =>
                            setNotes((prev) => ({
                              ...prev,
                              [withdrawal.id]: event.target.value,
                            }))
                          }
                          placeholder="Nota opcional"
                          className="w-56 rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-[var(--brand)]"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">
                          {withdrawal.adminNote ?? "-"}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(withdrawal, "paid")}
                            disabled={processingId === withdrawal.id}
                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                          >
                            {processingId === withdrawal.id
                              ? "Procesando..."
                              : "Marcar pagado"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(withdrawal, "rejected")
                            }
                            disabled={processingId === withdrawal.id}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                          >
                            Rechazar
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-slate-400">
                          Procesado
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

export default AdminWithdrawalsPage;
