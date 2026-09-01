import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  MailCheck,
  MapPin,
  Package,
  Pencil,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  Truck,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { getCurrentAuthUser, sendVerificationCode } from "../shared/services/auth.service";
import {
  getMyWallet,
  getMyWalletBalance,
} from "../shared/services/wallet.service";
import {
  deleteProduct,
  getMyProducts,
  setProductActive,
} from "../shared/services/product.service";
import {
  createUserAddress,
  deleteUserAddress,
  getMyAddresses,
  setDefaultUserAddress,
} from "../shared/services/userAddress.service";
import type { Product } from "../shared/types/Product";
import type { AuthUser } from "../shared/types/Auth";
import type { CreateUserAddressPayload, UserAddress } from "../shared/types/UserAddress";
import type { Wallet } from "../shared/types/Wallet";
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
import {
  buildAddressPayload,
  emptyAddressForm,
  formatUserAddress,
} from "../shared/utils/userAddress";

type ProfileLoadState = {
  wallet: Wallet | null;
  balance: number;
  addresses: UserAddress[];
  products: Product[];
};

type ProfileNavigationState = {
  emailVerified?: boolean;
};

const productApprovalStatusLabels = {
  pending: "Pendiente de aprobación",
  approved: "Aprobado",
  rejected: "Rechazado",
} as const;

const productApprovalStatusClasses = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
} as const;

type ProfileMenuItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  featured?: boolean;
};

const profileMenuGroups: { title: string; items: ProfileMenuItem[] }[] = [
  {
    title: "Compras",
    items: [
      { label: "Direcciones", to: "/profile#addresses", icon: MapPin },
      { label: "Mis compras", to: "/profile/orders", icon: ShoppingBag },
      { label: "Seguimiento de pedidos", to: "/profile/shipments", icon: Truck },
      { label: "Medios de pago", to: "/profile/payment-methods", icon: CreditCard },
    ],
  },
  {
    title: "Central de vendedores",
    items: [
      { label: "Vender", to: "/products/create", icon: Store, featured: true },
      { label: "Mis publicaciones", to: "/profile#products", icon: Package },
      { label: "Ventas realizadas", to: "/profile/sales", icon: CreditCard },
      { label: "Billetera", to: "/profile/wallet", icon: WalletCards },
    ],
  },
  {
    title: "Mi cuenta",
    items: [
      { label: "Datos personales", to: "/profile#personal", icon: CircleUserRound },
      { label: "Seguridad", to: "/profile#security", icon: ShieldCheck },
    ],
  },
];

function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = location.state as ProfileNavigationState | null;
  const [user] = useState(() => getUserFromToken());
  const [profileData, setProfileData] = useState<ProfileLoadState>({
    wallet: null,
    balance: 0,
    addresses: [],
    products: [],
  });
  const [addressForm, setAddressForm] =
    useState<CreateUserAddressPayload>(emptyAddressForm);
  const [isLoading, setIsLoading] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [productsError, setProductsError] = useState("");
  const [productActionId, setProductActionId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [isSendingVerificationCode, setIsSendingVerificationCode] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [accountUser, setAccountUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!location.hash) return;

    const section = document.getElementById(location.hash.slice(1));
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

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
        addressesResult,
        productsResult,
        accountUserResult,
      ] =
        await Promise.allSettled([
          getMyWallet(),
          getMyWalletBalance(),
          getMyAddresses(),
          getMyProducts(),
          getCurrentAuthUser(),
        ]);

      setProfileData({
        wallet: walletResult.status === "fulfilled" ? walletResult.value : null,
        balance: balanceResult.status === "fulfilled" ? balanceResult.value : 0,
        addresses:
          addressesResult.status === "fulfilled" ? addressesResult.value : [],
        products:
          productsResult.status === "fulfilled" ? productsResult.value : [],
      });

      if (
        walletResult.status === "rejected" ||
        balanceResult.status === "rejected"
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
      setIsAddressFormOpen(false);
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

  async function handleToggleProductActive(product: Product) {
    setProductsError("");
    setProductActionId(product.id);

    try {
      const updatedProduct = await setProductActive(
        product.id,
        !product.isActive
      );

      setProfileData((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === product.id ? { ...item, ...updatedProduct } : item
        ),
      }));
    } catch {
      setProductsError(
        product.isActive
          ? "No se pudo pausar la publicación. Intentá nuevamente."
          : "No se pudo reactivar la publicación. Intentá nuevamente."
      );
    } finally {
      setProductActionId(null);
    }
  }

  async function handleDeleteProduct() {
    if (!productToDelete) return;

    const productId = productToDelete.id;
    setProductsError("");
    setProductActionId(productId);

    try {
      await deleteProduct(productId);
      setProfileData((current) => ({
        ...current,
        products: current.products.filter((item) => item.id !== productId),
      }));
      setProductToDelete(null);
    } catch {
      setProductsError(
        "No se pudo eliminar la publicación. Intentá nuevamente."
      );
    } finally {
      setProductActionId(null);
    }
  }

  if (!user) return null;

  const userName = user.name ?? "Usuario BuyMarket";
  const userId = user.id ?? user.sub ?? "Sin id";
  const pendingBalance = Number(profileData.wallet?.pendingBalance ?? 0);
  const emailVerifiedFromNavigation =
    navigationState?.emailVerified === true;
  const isEmailVerified =
    isEmailVerifiedFromUser(accountUser) ||
    isEmailVerifiedFromUser(user) ||
    emailVerifiedFromNavigation ||
    isEmailVerifiedLocally(user);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[#f8f5ff] px-4 py-7 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="overflow-hidden rounded-[30px] border border-white/90 bg-white/90 p-5 shadow-[0_20px_60px_rgba(61,30,112,0.10)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#eee7ff] text-2xl font-black text-[#4d168f] ring-8 ring-[#f8f5ff]">
                {userName.trim().charAt(0).toUpperCase() || "B"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#6a2bbd]">
                  Mi cuenta
                </p>
                <h1 className="m-0 truncate text-3xl font-black text-slate-950 sm:text-4xl">
                  {userName}
                </h1>
                <p className="mt-1 truncate font-semibold text-slate-500">
                  {user.email ?? "Sin email"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-black ${
                  isEmailVerified
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                {isEmailVerified ? "Cuenta verificada" : "Verificación pendiente"}
              </span>
              <NavLink
                to="/products/create"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#4d168f] px-5 font-bold text-white shadow-lg shadow-[#4d168f]/15 transition hover:bg-[#38106a]"
              >
                <Store className="h-5 w-5" aria-hidden="true" />
                Vender un producto
              </NavLink>
            </div>
          </div>
        </header>

        <button
          type="button"
          onClick={() => navigate("/profile/wallet")}
          className="group flex w-full items-center gap-5 overflow-hidden rounded-[30px] border border-white/90 bg-[#351064] px-6 py-8 text-left text-white shadow-[0_20px_50px_rgba(53,16,100,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(53,16,100,0.32)] sm:gap-7 sm:px-8 sm:py-10"
        >
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#decfff] ring-1 ring-white/15 sm:h-20 sm:w-20">
            <WalletCards className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-black uppercase tracking-[0.18em] text-[#D8C7FF] sm:text-sm">
              Billetera BuyMarket
            </span>
            <span className="mt-1 block text-2xl font-black sm:text-3xl">
              Mi billetera
            </span>
            <span className="mt-2 block truncate text-sm font-semibold text-[#decfff] sm:text-base">
              {isLoading
                ? "Cargando saldo..."
                : walletError
                  ? "No se pudo cargar el saldo."
                  : `${profileData.balance.toLocaleString("es-AR")} disponibles`}
            </span>
            {!isLoading && !walletError && pendingBalance > 0 && (
              <span className="mt-1 block text-xs font-semibold text-amber-200 sm:text-sm">
                ${pendingBalance.toLocaleString("es-AR")} pendiente de retiro
              </span>
            )}
          </span>
          {!isLoading && !walletError && (
            <span className="hidden shrink-0 items-center gap-2 rounded-2xl bg-[#6045ac] px-5 py-3 text-sm font-black shadow-lg transition group-hover:bg-[#6d52b8] md:inline-flex">
              Ver billetera
              <ChevronRight
                className="h-5 w-5 transition group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          )}
          <ChevronRight
            className="h-7 w-7 shrink-0 text-[#decfff] transition group-hover:translate-x-0.5 md:hidden"
            aria-hidden="true"
          />
        </button>

        <nav aria-label="Accesos del perfil" className="grid gap-5 lg:grid-cols-3">
          {profileMenuGroups.map((group) => (
            <section
              key={group.title}
              className="rounded-[26px] border border-white/90 bg-white/75 p-4 shadow-[0_14px_38px_rgba(61,30,112,0.08)] backdrop-blur-sm"
            >
              <h2 className="mb-3 px-2 text-lg font-black text-[#4d168f]">
                {group.title}
              </h2>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.label}
                      to={item.to}
                      className={`group flex min-h-14 items-center gap-3 rounded-2xl px-3.5 py-3 transition ${
                        item.featured
                          ? "bg-[#ece5f8] hover:bg-[#e2d7f3]"
                          : "bg-[#f8f8fc] hover:bg-[#f0ebf8]"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4d168f] shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 font-bold text-slate-800">
                        {item.label}
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#4d168f]" aria-hidden="true" />
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

      <div className="space-y-6">
          <section id="personal" className="scroll-mt-28 rounded-[26px] border border-white/90 bg-white p-5 shadow-[0_14px_38px_rgba(61,30,112,0.08)] sm:p-6">
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

          <section id="security" className="scroll-mt-28 rounded-[26px] border border-white/90 bg-white p-5 shadow-[0_14px_38px_rgba(61,30,112,0.08)] sm:p-6">
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

          <section id="products" className="scroll-mt-28 rounded-[26px] border border-white/90 bg-white p-5 shadow-[0_14px_38px_rgba(61,30,112,0.08)] sm:p-6">
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
                  const approvalStatus = product.approvalStatus ?? "approved";
                  const isPaused =
                    approvalStatus === "approved" && !product.isActive;
                  const isWorking = productActionId === product.id;

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
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              isPaused
                                ? "bg-slate-200 text-slate-700"
                                : productApprovalStatusClasses[approvalStatus]
                            }`}
                          >
                            {isPaused
                              ? "Pausada"
                              : productApprovalStatusLabels[approvalStatus]}
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

                        {approvalStatus === "approved" && (
                          <button
                            type="button"
                            onClick={() => handleToggleProductActive(product)}
                            disabled={isWorking}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 transition hover:border-[var(--brand-border)] hover:text-[var(--brand)] disabled:cursor-wait disabled:opacity-60"
                          >
                            {product.isActive ? (
                              <PauseCircle className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <PlayCircle className="h-4 w-4" aria-hidden="true" />
                            )}
                            {isWorking
                              ? "Guardando..."
                              : product.isActive
                                ? "Pausar"
                                : "Reactivar"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          disabled={isWorking}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Eliminar
                        </button>

                        {approvalStatus === "approved" && product.isActive && (
                          <NavLink
                            to={`/products/${product.id}`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 transition hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
                          >
                            Ver
                          </NavLink>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section id="addresses" className="scroll-mt-28 rounded-[26px] border border-white/90 bg-white p-5 shadow-[0_14px_38px_rgba(61,30,112,0.08)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
                <h2 className="m-0 text-xl font-black text-slate-950">
                  Mis direcciones
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressFormOpen((current) => !current)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#eee7ff] px-4 text-sm font-black text-[#4d168f] transition hover:bg-[#e2d7f3]"
              >
                {isAddressFormOpen ? "Cerrar formulario" : "Agregar dirección"}
              </button>
            </div>

            {addressError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
                {addressError}
              </p>
            )}

            {isAddressFormOpen && (
            <form
              onSubmit={handleCreateAddress}
              className="mt-5 grid gap-3 rounded-2xl bg-[#faf9fd] p-4 sm:grid-cols-2"
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
            )}

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
        </div>

      </div>
      {productToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !productActionId) {
              setProductToDelete(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2
              id="delete-product-title"
              className="mt-5 text-2xl font-black text-slate-950"
            >
              ¿Eliminar publicación?
            </h2>
            <p className="mt-2 leading-6 text-slate-600">
              Vas a eliminar <strong>{productToDelete.title}</strong>. Esta
              acción no se puede deshacer.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={productActionId === productToDelete.id}
                className="h-11 rounded-xl border border-slate-200 px-5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={productActionId === productToDelete.id}
                className="h-11 rounded-xl bg-red-600 px-5 font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:bg-red-300"
              >
                {productActionId === productToDelete.id
                  ? "Eliminando..."
                  : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
