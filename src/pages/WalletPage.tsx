import { useEffect, useState } from "react";
import { ArrowLeft, WalletCards } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  getMyWallet,
  getMyWalletBalance,
  getMyWithdrawals,
  requestWithdrawal,
} from "../shared/services/wallet.service";
import type { Wallet, Withdrawal } from "../shared/types/Wallet";
import { getUserFromToken } from "../shared/utils/auth";

const emptyWithdrawalForm = {
  amount: "",
  alias: "",
  cbu: "",
};

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

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

type WalletLoadState = {
  wallet: Wallet | null;
  balance: number;
  withdrawals: Withdrawal[];
};

function WalletPage() {
  const navigate = useNavigate();
  const [user] = useState(() => getUserFromToken());
  const [profileData, setProfileData] = useState<WalletLoadState>({
    wallet: null,
    balance: 0,
    withdrawals: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState(emptyWithdrawalForm);
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState("");
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadWallet() {
      setIsLoading(true);
      setWalletError("");

      const [walletResult, balanceResult, withdrawalsResult] =
        await Promise.allSettled([
          getMyWallet(),
          getMyWalletBalance(),
          getMyWithdrawals(),
        ]);

      setProfileData({
        wallet: walletResult.status === "fulfilled" ? walletResult.value : null,
        balance: balanceResult.status === "fulfilled" ? balanceResult.value : 0,
        withdrawals:
          withdrawalsResult.status === "fulfilled" ? withdrawalsResult.value : [],
      });

      if (
        walletResult.status === "rejected" ||
        balanceResult.status === "rejected" ||
        withdrawalsResult.status === "rejected"
      ) {
        setWalletError("No se pudo cargar toda la informacion de la billetera.");
      }

      setIsLoading(false);
    }

    loadWallet();
  }, [navigate, user]);

  function handleWithdrawalChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setWithdrawalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleRequestWithdrawal(event: React.FormEvent) {
    event.preventDefault();
    setWithdrawalError("");
    setWithdrawalSuccess("");

    const amount = Number(withdrawalForm.amount);
    const alias = withdrawalForm.alias.trim();
    const cbu = withdrawalForm.cbu.trim();

    if (!amount || amount <= 0) {
      setWithdrawalError("Ingresa un monto mayor a 0.");
      return;
    }

    if (amount > profileData.balance) {
      setWithdrawalError("El monto no puede superar tu saldo disponible.");
      return;
    }

    if (!alias && !cbu) {
      setWithdrawalError("Ingresa un alias o CBU destino.");
      return;
    }

    try {
      setIsRequestingWithdrawal(true);
      await requestWithdrawal({
        amount,
        alias: alias || undefined,
        cbu: cbu || undefined,
      });

      const [walletResult, balanceResult, withdrawalsResult] =
        await Promise.allSettled([
          getMyWallet(),
          getMyWalletBalance(),
          getMyWithdrawals(),
        ]);

      setProfileData((prev) => ({
        ...prev,
        wallet: walletResult.status === "fulfilled" ? walletResult.value : prev.wallet,
        balance:
          balanceResult.status === "fulfilled" ? balanceResult.value : prev.balance,
        withdrawals:
          withdrawalsResult.status === "fulfilled"
            ? withdrawalsResult.value
            : prev.withdrawals,
      }));

      setWithdrawalForm(emptyWithdrawalForm);
      setWithdrawalSuccess("Solicitud de retiro enviada. La vas a ver como pendiente.");
      setIsWithdrawalFormOpen(false);
    } catch {
      setWithdrawalError("No se pudo solicitar el retiro.");
    } finally {
      setIsRequestingWithdrawal(false);
    }
  }

  if (!user) return null;

  const walletStatus = profileData.wallet?.isActive === false ? "Inactiva" : "Activa";
  const pendingBalance = Number(profileData.wallet?.pendingBalance ?? 0);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#f8f5ff] px-4 py-7 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <NavLink
          to="/profile"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#4d168f] transition hover:bg-[#ece5f8]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al perfil
        </NavLink>

        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Mi billetera
          </h1>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-sm font-black uppercase tracking-[0.14em] text-[#4d168f] shadow-sm">
            {walletStatus}
          </span>
        </header>

        <section className="overflow-hidden rounded-[28px] bg-[#351064] p-6 text-white shadow-[0_20px_50px_rgba(53,16,100,0.24)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#decfff]">
              <WalletCards className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="m-0 text-sm font-black uppercase tracking-[0.14em] text-[#D8C7FF]">
              Billetera BuyMarket
            </p>
          </div>

          {isLoading ? (
            <p className="mt-6 font-semibold text-slate-300">Cargando billetera...</p>
          ) : (
            <>
              <p className="mt-6 text-sm font-semibold text-slate-300">
                Saldo disponible
              </p>
              <strong className="mt-1 block text-4xl font-black sm:text-5xl">
                ${profileData.balance.toLocaleString("es-AR")}
              </strong>
              {pendingBalance > 0 && (
                <p className="mt-2 text-sm font-semibold text-amber-200">
                  ${pendingBalance.toLocaleString("es-AR")} pendiente de retiro
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setWithdrawalError("");
                  setWithdrawalSuccess("");
                  setIsWithdrawalFormOpen((prev) => !prev);
                }}
                disabled={profileData.balance <= 0}
                className="mt-6 w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-slate-600 sm:w-auto"
              >
                Retirar dinero
              </button>
            </>
          )}
        </section>

        {isWithdrawalFormOpen && (
          <form
            onSubmit={handleRequestWithdrawal}
            className="rounded-[26px] border border-white/90 bg-white p-5 shadow-[0_14px_38px_rgba(61,30,112,0.08)] sm:p-6"
          >
            <h2 className="m-0 text-xl font-black text-slate-950">
              Solicitar retiro
            </h2>
            <div className="mt-4 space-y-3">
              <input
                name="amount"
                type="number"
                min="1"
                max={profileData.balance}
                step="1"
                value={withdrawalForm.amount}
                onChange={handleWithdrawalChange}
                placeholder="Monto a retirar"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="alias"
                value={withdrawalForm.alias}
                onChange={handleWithdrawalChange}
                placeholder="Alias destino"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="cbu"
                value={withdrawalForm.cbu}
                onChange={handleWithdrawalChange}
                placeholder="CBU destino"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
            </div>

            {withdrawalError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                {withdrawalError}
              </p>
            )}

            <button
              disabled={isRequestingWithdrawal}
              className="mt-4 w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8]"
            >
              {isRequestingWithdrawal ? "Enviando..." : "Solicitar retiro"}
            </button>
          </form>
        )}

        {withdrawalSuccess && (
          <p className="rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
            {withdrawalSuccess}
          </p>
        )}

        {walletError && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-700">
            {walletError}
          </p>
        )}

        <section className="rounded-[26px] border border-white/90 bg-white p-5 shadow-[0_14px_38px_rgba(61,30,112,0.08)] sm:p-6">
          <h2 className="m-0 text-xl font-black text-slate-950">
            Movimientos y retiros
          </h2>

          {isLoading ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
              Cargando billetera...
            </p>
          ) : profileData.withdrawals.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
              Todavia no tenes solicitudes de retiro.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {profileData.withdrawals.map((withdrawal) => (
                <article
                  key={withdrawal.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">
                        ${(withdrawal.amount ?? 0).toLocaleString("es-AR")}
                      </p>
                      <p className="text-sm font-semibold text-slate-500">
                        {formatDate(withdrawal.createdAt)}
                      </p>
                      {(withdrawal.alias || withdrawal.cbu) && (
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          Destino: {withdrawal.alias || withdrawal.cbu}
                        </p>
                      )}
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-sm font-black uppercase ${
                        withdrawalStatusClasses[withdrawal.status ?? "pending"] ??
                        "bg-white text-slate-600"
                      }`}
                    >
                      {withdrawalStatusLabels[withdrawal.status ?? "pending"] ??
                        withdrawal.status ??
                        "Pendiente"}
                    </span>
                  </div>
                  {withdrawal.adminNote && (
                    <p className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                      Nota admin: {withdrawal.adminNote}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default WalletPage;
