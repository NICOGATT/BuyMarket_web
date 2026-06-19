import { useEffect, useState } from "react";
import { MapPin, Star, Trash2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  getMyWallet,
  getMyWalletBalance,
  getMyWithdrawals,
} from "../shared/services/wallet.service";
import {
  createUserAddress,
  deleteUserAddress,
  getMyAddresses,
  setDefaultUserAddress,
} from "../shared/services/userAddress.service";
import type { CreateUserAddressPayload, UserAddress } from "../shared/types/UserAddress";
import type { Wallet, Withdrawal } from "../shared/types/Wallet";
import { getUserFromToken } from "../shared/utils/auth";
import { formatUserAddress } from "../shared/utils/userAddress";

type ProfileLoadState = {
  wallet: Wallet | null;
  balance: number;
  withdrawals: Withdrawal[];
  addresses: UserAddress[];
};

const emptyAddressForm: CreateUserAddressPayload = {
  label: "",
  street: "",
  number: "",
  floor: "",
  apartment: "",
  city: "",
  province: "",
  postalCode: "",
  reference: "",
  isDefault: false,
};

function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user] = useState(() => getUserFromToken());
  const [profileData, setProfileData] = useState<ProfileLoadState>({
    wallet: null,
    balance: 0,
    withdrawals: [],
    addresses: [],
  });
  const [addressForm, setAddressForm] =
    useState<CreateUserAddressPayload>(emptyAddressForm);
  const [isLoading, setIsLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
      setIsLoading(true);
      setWalletError("");

      const [walletResult, balanceResult, withdrawalsResult, addressesResult] =
        await Promise.allSettled([
          getMyWallet(),
          getMyWalletBalance(),
          getMyWithdrawals(),
          getMyAddresses(),
        ]);

      setProfileData({
        wallet: walletResult.status === "fulfilled" ? walletResult.value : null,
        balance: balanceResult.status === "fulfilled" ? balanceResult.value : 0,
        withdrawals:
          withdrawalsResult.status === "fulfilled" ? withdrawalsResult.value : [],
        addresses:
          addressesResult.status === "fulfilled" ? addressesResult.value : [],
      });

      if (
        walletResult.status === "rejected" ||
        balanceResult.status === "rejected" ||
        withdrawalsResult.status === "rejected"
      ) {
        setWalletError("No se pudo cargar toda la informacion de la billetera.");
      }

      if (addressesResult.status === "rejected") {
        setAddressError("No se pudieron cargar tus direcciones.");
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [navigate, user]);

  function handleAddressChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;
    const checked =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;

    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleCreateAddress(event: React.FormEvent) {
    event.preventDefault();
    setAddressError("");

    try {
      setIsSavingAddress(true);
      const newAddress = await createUserAddress(addressForm);

      setProfileData((prev) => ({
        ...prev,
        addresses: newAddress.isDefault
          ? prev.addresses.map((address) => ({
              ...address,
              isDefault: false,
            })).concat(newAddress)
          : prev.addresses.concat(newAddress),
      }));
      setAddressForm(emptyAddressForm);
    } catch {
      setAddressError("No se pudo guardar la direccion.");
    } finally {
      setIsSavingAddress(false);
    }
  }

  async function handleSetDefaultAddress(id: string) {
    setAddressError("");

    try {
      const updatedAddress = await setDefaultUserAddress(id);

      setProfileData((prev) => ({
        ...prev,
        addresses: prev.addresses.map((address) => ({
          ...address,
          isDefault: address.id === updatedAddress.id,
        })),
      }));
    } catch {
      setAddressError("No se pudo marcar la direccion como predeterminada.");
    }
  }

  async function handleDeleteAddress(id: string) {
    setAddressError("");

    try {
      await deleteUserAddress(id);
      setProfileData((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((address) => address.id !== id),
      }));
    } catch {
      setAddressError("No se pudo eliminar la direccion.");
    }
  }

  if (!user) return null;

  const userName = user.name ?? "Usuario BuyMarket";
  const userId = user.id ?? user.sub ?? "Sin id";
  const walletStatus = profileData.wallet?.isActive === false ? "Inactiva" : "Activa";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-blue-600">
            Cuenta
          </p>
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Mi perfil
          </h1>
        </div>

        <NavLink
          to="/products/create"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 font-bold text-white transition hover:bg-blue-700"
        >
          Publicar producto
        </NavLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="m-0 text-xl font-black text-slate-950">
              Datos personales
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Nombre</p>
                <p className="mt-1 truncate text-lg font-black text-slate-950">
                  {userName}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Email</p>
                <p className="mt-1 truncate text-lg font-black text-slate-950">
                  {user.email ?? "Sin email"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Rol</p>
                <p className="mt-1 text-lg font-black capitalize text-slate-950">
                  {user.role ?? "user"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">ID de cuenta</p>
                <p className="mt-1 truncate text-lg font-black text-slate-950">
                  {userId}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 className="m-0 text-xl font-black text-slate-950">
                Mis direcciones
              </h2>
            </div>

            {addressError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                {addressError}
              </p>
            )}

            <form
              onSubmit={handleCreateAddress}
              className="mt-5 grid gap-3 sm:grid-cols-2"
            >
              <input
                name="label"
                placeholder="Etiqueta: Casa, Trabajo, Local"
                value={addressForm.label}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <input
                name="street"
                placeholder="Calle"
                value={addressForm.street}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <input
                name="number"
                placeholder="Numero"
                value={addressForm.number}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <input
                name="postalCode"
                placeholder="Codigo postal"
                value={addressForm.postalCode}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <input
                name="city"
                placeholder="Ciudad"
                value={addressForm.city}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <input
                name="province"
                placeholder="Provincia"
                value={addressForm.province}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <input
                name="floor"
                placeholder="Piso"
                value={addressForm.floor}
                onChange={handleAddressChange}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <input
                name="apartment"
                placeholder="Departamento"
                value={addressForm.apartment}
                onChange={handleAddressChange}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
              <textarea
                name="reference"
                placeholder="Referencia para el repartidor"
                value={addressForm.reference}
                onChange={handleAddressChange}
                className="min-h-24 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 sm:col-span-2"
              />

              <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 font-bold text-slate-700 sm:col-span-2">
                <input
                  name="isDefault"
                  type="checkbox"
                  checked={Boolean(addressForm.isDefault)}
                  onChange={handleAddressChange}
                  className="h-4 w-4"
                />
                Usar como direccion predeterminada
              </label>

              <button
                disabled={isSavingAddress}
                className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:col-span-2"
              >
                {isSavingAddress ? "Guardando..." : "Guardar direccion"}
              </button>
            </form>

            {isLoading ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Cargando direcciones...
              </p>
            ) : profileData.addresses.length === 0 ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Todavia no tenes direcciones guardadas.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {profileData.addresses.map((address) => (
                  <article
                    key={address.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="m-0 text-lg font-black text-slate-950">
                            {address.label}
                          </h3>
                          {address.isDefault && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase text-blue-700">
                              Predeterminada
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-semibold text-slate-700">
                          {formatUserAddress(address)}
                        </p>
                        {address.reference && (
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {address.reference}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        {!address.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
                            aria-label="Marcar como predeterminada"
                          >
                            <Star size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-white text-red-600 transition hover:bg-red-50"
                          aria-label="Eliminar direccion"
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

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="m-0 text-xl font-black text-slate-950">
                Movimientos y retiros
              </h2>
              {walletError && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                  Datos parciales
                </span>
              )}
            </div>

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
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-black text-slate-950">
                        $
                        {(withdrawal.amount ?? 0).toLocaleString("es-AR")}
                      </p>
                      <p className="text-sm font-semibold text-slate-500">
                        {formatDate(withdrawal.createdAt)}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-white px-3 py-1 text-sm font-black uppercase text-slate-600">
                      {withdrawal.status ?? "pendiente"}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-black uppercase text-blue-200">
              Billetera
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-300">
              Saldo disponible
            </p>
            <strong className="mt-1 block text-4xl font-black">
              ${profileData.balance.toLocaleString("es-AR")}
            </strong>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-300">Estado</span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-950">
                  {walletStatus}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-300">Wallet ID</span>
                <p className="mt-1 break-all text-sm font-bold text-white">
                  {profileData.wallet?.id ?? "Sin billetera asignada"}
                </p>
              </div>
            </div>
          </section>

          {walletError && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-700">
              {walletError}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default ProfilePage;
