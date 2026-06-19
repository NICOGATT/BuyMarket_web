import { useEffect, useMemo, useState } from "react";
import { WalletCards } from "lucide-react";
import { getUsers } from "../../shared/services/user.service";
import {
  getWallets,
  syncMissingWallets,
} from "../../shared/services/wallet.service";
import type { User } from "../../shared/types/User";
import type { Wallet } from "../../shared/types/Wallet";

function getUserName(user: User) {
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return fullName || "Sin nombre";
}

function getWalletUserId(wallet: Wallet) {
  return wallet.userId ?? wallet.user?.id ?? null;
}

function getUserWallet(user: User, wallets: Wallet[]): Wallet | null {
  if (user.wallet) return user.wallet;
  if (user.walletId) return { id: user.walletId, userId: user.id };
  return wallets.find((wallet) => getWalletUserId(wallet) === user.id) ?? null;
}

function formatMoney(value?: number) {
  return (value ?? 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
}

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingWallets, setIsSyncingWallets] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const usersWithWallet = useMemo(
    () => users.filter((user) => Boolean(getUserWallet(user, wallets))),
    [users, wallets]
  );

  const usersWithoutWallet = useMemo(
    () => users.filter((user) => !getUserWallet(user, wallets)),
    [users, wallets]
  );

  async function loadUsersAndWallets() {
    try {
      const [usersData, walletsData] = await Promise.all([
        getUsers(),
        getWallets(),
      ]);
      setUsers(usersData);
      setWallets(walletsData);
    } catch {
      setError("No se pudieron cargar los usuarios o las wallets.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([getUsers(), getWallets()])
      .then(([usersData, walletsData]) => {
        setUsers(usersData);
        setWallets(walletsData);
      })
      .catch(() => {
        setError("No se pudieron cargar los usuarios o las wallets.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function handleSyncMissingWallets() {
    setError("");
    setSuccess("");
    setIsSyncingWallets(true);

    try {
      await syncMissingWallets();
      await loadUsersAndWallets();
      setSuccess("Wallets faltantes sincronizadas correctamente.");
    } catch {
      setError("No se pudieron sincronizar las wallets faltantes.");
    } finally {
      setIsSyncingWallets(false);
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Cargando usuarios...</p>;
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Usuarios
        </h1>

        <p className="mt-2 text-slate-500">
          Control de cuentas registradas y estado de wallets.
        </p>
      </div>

      {error && (
        <div className="mb-6 space-y-3">
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="mb-6 space-y-3">
          <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 font-bold text-green-700">
            {success}
          </p>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-400">
            Con wallet
          </p>
          <h2 className="m-0 mt-3 text-4xl font-black text-slate-950">
            {usersWithWallet.length}
          </h2>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-400">
            Sin wallet
          </p>
          <h2 className="m-0 mt-3 text-4xl font-black text-slate-950">
            {usersWithoutWallet.length}
          </h2>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <WalletCards className="h-6 w-6 text-green-700" aria-hidden />
            <div>
              <h2 className="m-0 text-xl font-black text-slate-950">
                Usuarios con wallet
              </h2>
              <p className="text-sm text-slate-500">
                Cuentas que ya tienen wallet asignada.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[620px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Saldo</th>
                  <th className="px-4 py-3">Wallet</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {usersWithWallet.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Todavia no hay usuarios con wallet.
                    </td>
                  </tr>
                )}

                {usersWithWallet.map((user) => {
                  const wallet = getUserWallet(user, wallets);

                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        {getUserName(user)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatMoney(wallet?.balance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {wallet?.id ?? "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
            <WalletCards className="h-6 w-6 text-blue-600" aria-hidden />
            <div>
              <h2 className="m-0 text-xl font-black text-slate-950">
                Usuarios sin wallet
              </h2>
              <p className="text-sm text-slate-500">
                Estas cuentas no aparecen asociadas a ninguna wallet.
              </p>
            </div>
            </div>

            <button
              type="button"
              onClick={handleSyncMissingWallets}
              disabled={usersWithoutWallet.length === 0 || isSyncingWallets}
              className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSyncingWallets ? "Sincronizando..." : "Crear wallets faltantes"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-[620px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {usersWithoutWallet.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Todos los usuarios tienen wallet.
                    </td>
                  </tr>
                )}

                {usersWithoutWallet.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {getUserName(user)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.role || "user"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500">
                        Pendiente
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminUsersPage;
