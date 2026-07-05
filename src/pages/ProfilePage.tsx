import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  MailCheck,
  MapPin,
  Package,
  Pencil,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getCurrentAuthUser, sendVerificationCode } from "../shared/services/auth.service";
import {
  getMyWallet,
  getMyWalletBalance,
  getMyWithdrawals,
  requestWithdrawal,
} from "../shared/services/wallet.service";
import { getMyProducts } from "../shared/services/product.service";
import {
  createUserAddress,
  deleteUserAddress,
  getMyAddresses,
  setDefaultUserAddress,
} from "../shared/services/userAddress.service";
import type { Product } from "../shared/types/Product";
import type { AuthUser } from "../shared/types/Auth";
import type { CreateUserAddressPayload, UserAddress } from "../shared/types/UserAddress";
import type { Wallet, Withdrawal } from "../shared/types/Wallet";
import {
  getUserFromToken,
  isEmailVerifiedFromUser,
  isEmailVerifiedLocally,
} from "../shared/utils/auth";
import { getProductFirstImage } from "../shared/utils/productImages";
import {
  getDisplayPrice,
  getVariantTotalStock,
  hasProductVariants,
} from "../shared/utils/productVariants";
import { formatUserAddress } from "../shared/utils/userAddress";

type ProfileLoadState = {
  wallet: Wallet | null;
  balance: number;
  withdrawals: Withdrawal[];
  addresses: UserAddress[];
  products: Product[];
};

const emptyAddressForm: CreateUserAddressPayload = {
  label: "",
  receiverName: "",
  phone: "",
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

function buildAddressPayload(
  form: CreateUserAddressPayload,
  defaultReceiverName: string
): CreateUserAddressPayload | string {
  const receiverName = form.receiverName?.trim() || defaultReceiverName.trim();
  const payload: CreateUserAddressPayload = {
    label: form.label.trim(),
    receiverName,
    phone: form.phone.trim(),
    street: form.street.trim(),
    number: form.number.trim(),
    city: form.city.trim(),
    province: form.province.trim(),
    postalCode: form.postalCode.trim(),
    isDefault: Boolean(form.isDefault),
  };

  if (!payload.label) return "Ingresa una etiqueta para la direccion.";
  if (!payload.phone) return "Ingresa un telefono de contacto.";
  if (!payload.street) return "Ingresa la calle.";
  if (!payload.number) return "Ingresa el numero.";
  if (!payload.city) return "Ingresa la ciudad o localidad.";
  if (!payload.province) return "Ingresa la provincia.";
  if (!payload.postalCode) return "Ingresa el codigo postal.";

  const floor = form.floor?.trim();
  const apartment = form.apartment?.trim();
  const reference = form.reference?.trim();

  if (floor) payload.floor = floor;
  if (apartment) payload.apartment = apartment;
  if (reference) payload.reference = reference;

  return payload;
}

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => getUserFromToken());
  const [profileData, setProfileData] = useState<ProfileLoadState>({
    wallet: null,
    balance: 0,
    withdrawals: [],
    addresses: [],
    products: [],
  });
  const [addressForm, setAddressForm] =
    useState<CreateUserAddressPayload>(emptyAddressForm);
  const [isLoading, setIsLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isWithdrawalFormOpen, setIsWithdrawalFormOpen] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState(emptyWithdrawalForm);
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState("");
  const [isRequestingWithdrawal, setIsRequestingWithdrawal] = useState(false);
  const [isSendingVerificationCode, setIsSendingVerificationCode] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [accountUser, setAccountUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    async function loadProfile() {
      setIsLoading(true);
      setWalletError("");
      setProductsError("");

      const [
        walletResult,
        balanceResult,
        withdrawalsResult,
        addressesResult,
        productsResult,
        accountUserResult,
      ] =
        await Promise.allSettled([
          getMyWallet(),
          getMyWalletBalance(),
          getMyWithdrawals(),
          getMyAddresses(),
          getMyProducts(),
          getCurrentAuthUser(),
        ]);

      setProfileData({
        wallet: walletResult.status === "fulfilled" ? walletResult.value : null,
        balance: balanceResult.status === "fulfilled" ? balanceResult.value : 0,
        withdrawals:
          withdrawalsResult.status === "fulfilled" ? withdrawalsResult.value : [],
        addresses:
          addressesResult.status === "fulfilled" ? addressesResult.value : [],
        products:
          productsResult.status === "fulfilled" ? productsResult.value : [],
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

      if (productsResult.status === "rejected") {
        setProductsError("No se pudieron cargar tus productos.");
      }

      if (accountUserResult.status === "fulfilled") {
        setAccountUser(accountUserResult.value);
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

    const payload = buildAddressPayload(addressForm, userName);

    if (typeof payload === "string") {
      setAddressError(payload);
      return;
    }

    try {
      setIsSavingAddress(true);
      const newAddress = await createUserAddress(payload);

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
    } catch (createError) {
      setAddressError(
        createError instanceof Error
          ? createError.message
          : "No se pudo guardar la direccion."
      );
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

  async function handleSendVerificationCode() {
    setVerificationError("");
    setVerificationSuccess("");

    try {
      setIsSendingVerificationCode(true);
      const response = await sendVerificationCode();

      setVerificationSuccess(
        response.message || "Te enviamos un código de verificación a tu email."
      );
    } catch {
      setVerificationError("No se pudo enviar el código. Intentá nuevamente.");
    } finally {
      setIsSendingVerificationCode(false);
    }
  }

  if (!user) return null;

  const userName = user.name ?? "Usuario BuyMarket";
  const userId = user.id ?? user.sub ?? "Sin id";
  const walletStatus = profileData.wallet?.isActive === false ? "Inactiva" : "Activa";
  const pendingBalance = Number(profileData.wallet?.pendingBalance ?? 0);
  const emailVerifiedFromNavigation =
    (location.state as { emailVerified?: boolean } | null)?.emailVerified === true;
  const isEmailVerified =
    isEmailVerifiedFromUser(accountUser) ||
    isEmailVerifiedFromUser(user) ||
    emailVerifiedFromNavigation ||
    isEmailVerifiedLocally(user);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-[var(--brand)]">
            Cuenta
          </p>
          <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
            Mi perfil
          </h1>
        </div>

        <NavLink
          to="/products/create"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 font-bold text-white transition hover:bg-[var(--brand-hover)]"
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-black uppercase text-[var(--brand)]">
                    Seguridad
                  </p>
                  <h2 className="m-0 text-xl font-black text-slate-950">
                    Estado de la cuenta
                  </h2>
                  <p className="mt-2 max-w-xl text-sm font-semibold text-slate-500">
                    Verificá tu email para proteger la cuenta y mantener tus datos
                    actualizados.
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${
                  isEmailVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isEmailVerified ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {isEmailVerified ? "Email verificado" : "Verificación pendiente"}
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-500">Email de la cuenta</p>
                <p className="mt-1 truncate text-lg font-black text-slate-950">
                  {user.email ?? "Sin email"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={isSendingVerificationCode || !user.email || isEmailVerified}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8]"
              >
                <MailCheck className="h-5 w-5" aria-hidden="true" />
                {isSendingVerificationCode
                  ? "Enviando..."
                  : isEmailVerified
                    ? "Email verificado"
                    : "Enviar código de verificación"}
              </button>
            </div>

            {verificationSuccess && !isEmailVerified && (
              <div
                role="status"
                className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 font-semibold text-green-700"
              >
                <p>{verificationSuccess}</p>
                <NavLink
                  to="/profile/verify-email"
                  className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-700"
                >
                  Ingresar código
                </NavLink>
              </div>
            )}

            {verificationError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700"
              >
                {verificationError}
              </p>
            )}
          </section>

          <NavLink
            to="/profile/orders"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--brand-border)] bg-white p-5 shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-black text-slate-950">
                  Mis compras
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  Ver pedidos realizados y estado del pago
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">
              Ver compras
            </span>
          </NavLink>

          <NavLink
            to="/profile/sales"
            className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Package className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-black text-slate-950">
                  Mis ventas
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  Ver productos vendidos, compradores y variantes
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
              Ver ventas
            </span>
          </NavLink>

          <NavLink
            to="/profile/payment-methods"
            className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-black text-slate-950">
                  Medios de pago
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  Administrar opciones para usar en checkout
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-cyan-700 px-4 py-2 text-sm font-bold text-white">
              Gestionar
            </span>
          </NavLink>

          <NavLink
            to="/profile/shipments"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--nav-blue-border)] bg-white p-5 shadow-sm transition hover:border-[var(--nav-blue-hover)] hover:bg-[var(--nav-blue-soft)]"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--nav-blue-soft)] text-[var(--nav-blue)]">
                <Truck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xl font-black text-slate-950">
                  Mis envíos
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  Seguir compras con envío y repartidor asignado
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-xl bg-[var(--nav-blue)] px-4 py-2 text-sm font-bold text-white">
              Ver envíos
            </span>
          </NavLink>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
                <h2 className="m-0 text-xl font-black text-slate-950">
                  Mis productos
                </h2>
              </div>

              <NavLink
                to="/products/create"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)]"
              >
                Publicar
              </NavLink>
            </div>

            {productsError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                {productsError}
              </p>
            )}

            {isLoading ? (
              <p className="mt-5 rounded-xl bg-slate-50 p-5 font-semibold text-slate-500">
                Cargando productos...
              </p>
            ) : profileData.products.length === 0 ? (
              <div className="mt-5 rounded-xl bg-slate-50 p-5">
                <p className="font-semibold text-slate-500">
                  Todavia no publicaste productos.
                </p>
                <NavLink
                  to="/products/create"
                  className="mt-4 inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 font-bold text-white transition hover:bg-[var(--brand-hover)]"
                >
                  Publicar mi primer producto
                </NavLink>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {profileData.products.map((product) => {
                  const image = getProductFirstImage(product);
                  const hasVariants = hasProductVariants(product);
                  const displayPrice = getDisplayPrice(product);
                  const displayStock = getVariantTotalStock(product) ?? product.stock;

                  return (
                    <article
                      key={product.id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-[var(--brand)]">
                        {image ? (
                          <img
                            src={image}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={24} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-slate-950">
                          {product.title}
                        </h3>
                        <p className="line-clamp-2 text-sm font-semibold text-slate-500">
                          {product.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[var(--brand)]">
                            {hasVariants ? "Desde " : ""}$
                            {Number(displayPrice).toLocaleString("es-AR")}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600">
                            Stock: {displayStock}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-600">
                            {product.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <NavLink
                          to={`/products/${product.id}/edit`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-bold text-white transition hover:bg-[var(--brand-hover)]"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Editar
                        </NavLink>

                        <NavLink
                          to={`/products/${product.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 transition hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
                        >
                          Ver
                        </NavLink>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
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
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="receiverName"
                placeholder="Nombre de quien recibe (opcional)"
                value={addressForm.receiverName ?? ""}
                onChange={handleAddressChange}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="phone"
                placeholder="Telefono de contacto"
                value={addressForm.phone}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="street"
                placeholder="Calle"
                value={addressForm.street}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="number"
                placeholder="Numero"
                value={addressForm.number}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="postalCode"
                placeholder="Codigo postal"
                value={addressForm.postalCode}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="city"
                placeholder="Ciudad"
                value={addressForm.city}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="province"
                placeholder="Provincia"
                value={addressForm.province}
                onChange={handleAddressChange}
                required
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="floor"
                placeholder="Piso"
                value={addressForm.floor}
                onChange={handleAddressChange}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <input
                name="apartment"
                placeholder="Departamento"
                value={addressForm.apartment}
                onChange={handleAddressChange}
                className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
              />
              <textarea
                name="reference"
                placeholder="Referencia para el repartidor"
                value={addressForm.reference}
                onChange={handleAddressChange}
                className="min-h-24 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)] sm:col-span-2"
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
                className="rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8] sm:col-span-2"
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
                            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-black uppercase text-[var(--brand-hover)]">
                              Predeterminada
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-semibold text-slate-700">
                          {formatUserAddress(address)}
                        </p>
                        {(address.receiverName || address.phone) && (
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            Recibe: {address.receiverName || "-"}
                            {address.phone ? ` - ${address.phone}` : ""}
                          </p>
                        )}
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
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
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

        <aside className="space-y-6">
          <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-black uppercase text-[#D8C7FF]">
              Billetera
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-300">
              Saldo disponible
            </p>
            <strong className="mt-1 block text-4xl font-black">
              ${profileData.balance.toLocaleString("es-AR")}
            </strong>
            {pendingBalance > 0 && (
              <p className="mt-2 text-sm font-semibold text-amber-200">
                ${pendingBalance.toLocaleString("es-AR")} pendiente de retiro
              </p>
            )}

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

            <button
              type="button"
              onClick={() => {
                setWithdrawalError("");
                setWithdrawalSuccess("");
                setIsWithdrawalFormOpen((prev) => !prev);
              }}
              disabled={profileData.balance <= 0}
              className="mt-6 w-full rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              Retirar dinero
            </button>
          </section>

          {isWithdrawalFormOpen && (
            <form
              onSubmit={handleRequestWithdrawal}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
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
        </aside>
      </div>
    </section>
  );
}

export default ProfilePage;
