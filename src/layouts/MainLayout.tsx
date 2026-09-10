import { ChevronDown, CreditCard, Mail, MapPin, Minus, PackagePlus, Plus, Search, ShoppingBag, ShoppingCart, Trash2, Truck, User, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CART_CHANGE_EVENT,
  getCart,
  isAuthRequiredError,
  removeCartItem,
  updateCartItem,
} from "../features/cart/store/cartStore";
import type { CartItem } from "../shared/types/Cart";
import {
  formatVariantLabel,
  getCartItemUnitPrice,
} from "../shared/utils/productVariants";
import { getUserFromToken, logout } from "../shared/utils/auth";
import { getCategories } from "../shared/services/category.service";
import {
  createUserAddress,
  getMyAddresses,
  setDefaultUserAddress,
} from "../shared/services/userAddress.service";
import type { Category } from "../shared/types/Category";
import type { CreateUserAddressPayload, UserAddress } from "../shared/types/UserAddress";
import {
  buildAddressPayload,
  emptyAddressForm,
  formatUserAddress,
} from "../shared/utils/userAddress";

const priorityCategoryAliases = [
  ["mascotas"],
  ["tecno", "tecnologia"],
  ["computacion"],
  ["indumentaria"],
  ["calzados", "calzado"],
  ["deco/bazar", "deco y bazar", "deco-bazar", "deco bazar"],
  ["belleza"],
];

function normalizeCategoryName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]/g, "");
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}

function formatShortUserAddress(address: UserAddress) {
  const apartment = [address.floor, address.apartment]
    .filter(Boolean)
    .join(" ");

  return `${address.street} ${address.number}${
    apartment ? `, ${apartment}` : ""
  }`;
}

function MainLayout() {
  const [user, setUser] = useState(getUserFromToken());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [updatingCartItemId, setUpdatingCartItemId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] =
    useState<CreateUserAddressPayload>(emptyAddressForm);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(window.location.search).get("search") ?? ""
  );
  const navigate = useNavigate();
  const location = useLocation();
  const currentSearchParams = new URLSearchParams(location.search);
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/auth/reset-password";
  const isCategoryCatalogPage =
    location.pathname === "/products" && currentSearchParams.has("category");
  const isCreateProductPage =
    location.pathname === "/products/create" ||
    /^\/products\/[^/]+\/edit$/.test(location.pathname);
  const isProfilePage = location.pathname.startsWith("/profile");

  useEffect(() => {
    function syncAuth() {
      setUser(getUserFromToken());
    }

    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await getCategories());
      } catch {
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadAddresses() {
      if (!user) {
        setAddresses([]);
        setSelectedAddressId("");
        return;
      }

      try {
        const data = await getMyAddresses();
        const defaultAddress = data.find((address) => address.isDefault);
        const selectedAddress = defaultAddress ?? data[0];

        setAddresses(data);
        setSelectedAddressId(selectedAddress?.id ?? "");
      } catch {
        setAddresses([]);
        setSelectedAddressId("");
      }
    }

    loadAddresses();
  }, [user]);

  useEffect(() => {
    async function syncCart() {
      try {
        const data = await getCart();
        setCart(data);
      } catch {
        setCart([]);
      }
    }

    syncCart();
    window.addEventListener(CART_CHANGE_EVENT, syncCart);
    window.addEventListener("auth-change", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, syncCart);
      window.removeEventListener("auth-change", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId
  );
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + getCartItemUnitPrice(item) * item.quantity,
    0
  );

  async function handleRemoveCartItem(item: CartItem) {
    if (!item.id) return;

    try {
      setUpdatingCartItemId(item.id);
      await removeCartItem(item.id);
      setCart((currentCart) =>
        currentCart.filter((cartItem) => cartItem.id !== item.id)
      );
    } catch (removeError) {
      if (isAuthRequiredError(removeError)) {
        navigate("/login");
        return;
      }

      alert("No se pudo eliminar el producto del carrito.");
    } finally {
      setUpdatingCartItemId(null);
    }
  }

  async function handleCartItemQuantity(item: CartItem, quantity: number) {
    if (!item.id || !Number.isFinite(quantity)) return;

    if (quantity < 1) {
      await handleRemoveCartItem(item);
      return;
    }

    if (quantity === item.quantity) return;

    try {
      setUpdatingCartItemId(item.id);
      const updatedCart = await updateCartItem(item.id, { quantity });
      setCart(updatedCart);
    } catch (updateError) {
      if (isAuthRequiredError(updateError)) {
        navigate("/login");
        return;
      }

      alert("No se pudo actualizar la cantidad.");
    } finally {
      setUpdatingCartItemId(null);
    }
  }
  const priorityCategories = useMemo(() => {
    const usedCategoryIds = new Set<string>();
    const normalizedCategories = categories.map((category) => ({
      category,
      normalizedName: normalizeCategoryName(category.name),
    }));

    return priorityCategoryAliases.flatMap((aliases) => {
      const normalizedAliases = aliases.map(normalizeCategoryName);
      const match = normalizedAliases
        .map((alias) =>
          normalizedCategories.find(
            ({ category, normalizedName }) =>
              !usedCategoryIds.has(category.id) && normalizedName === alias
          )
        )
        .find(Boolean);

      if (!match) return [];

      usedCategoryIds.add(match.category.id);
      return [match.category];
    });
  }, [categories]);

  function handleLogout() {
    logout();
    setUser(null);
    setIsUserMenuOpen(false);
    navigate("/login");
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchTerm.trim();

    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  }

  async function handleSelectAddress(addressId: string) {
    if (!addressId) return;

    setSelectedAddressId(addressId);
    setIsAddressDropdownOpen(false);

    try {
      await setDefaultUserAddress(addressId);
      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          isDefault: address.id === addressId,
        }))
      );
    } catch {
      // La seleccion local sigue vigente aunque el backend no la persista.
    }
  }

  function handleOpenAddressModal() {
    setIsAddressDropdownOpen(false);
    setAddressError("");
    setAddressForm(emptyAddressForm);
    setIsAddressModalOpen(true);
  }

  function handleCloseAddressModal() {
    if (isSavingAddress) return;
    setIsAddressModalOpen(false);
    setAddressError("");
  }

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

    const payload = buildAddressPayload(addressForm, user?.name ?? "Usuario BuyMarket");

    if (typeof payload === "string") {
      setAddressError(payload);
      return;
    }

    try {
      setIsSavingAddress(true);
      const newAddress = await createUserAddress(payload);

      setAddresses((current) =>
        newAddress.isDefault
          ? current.map((address) => ({ ...address, isDefault: false })).concat(newAddress)
          : current.concat(newAddress)
      );
      setSelectedAddressId(newAddress.id);
      setIsAddressModalOpen(false);
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

  useEffect(() => {
    if (!isAddressModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (isSavingAddress) return;
      setIsAddressModalOpen(false);
      setAddressError("");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddressModalOpen, isSavingAddress]);

  return (
    <div className={`min-h-screen ${isProfilePage ? "bg-[#f8f5ff]" : "bg-transparent"} text-[var(--text-main)]`}>
      <ScrollToTop />
      <header className={`${isAuthPage ? "hidden" : ""} sticky top-0 z-40 border-b border-[#123b82] bg-[#02082b] shadow-[0_12px_32px_rgba(0,4,30,0.38)]`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2 sm:gap-4 lg:grid-cols-[auto_minmax(280px,1fr)_auto]">
            <div className="flex items-center justify-between gap-4">
              <NavLink to="/" className="flex min-w-0 items-center gap-2">
                <img
                  src="/buymarket-logo-compact.png"
                  alt="BuyMarket"
                  className="h-9 w-12 shrink-0 object-contain opacity-100 sm:h-10 sm:w-14"
                />
                <span
                  className="hidden whitespace-nowrap py-0.5 text-xl font-extrabold leading-[1.2] tracking-[-0.025em] text-white sm:block sm:text-[22px]"
                >
                  BuyMarket
                </span>
              </NavLink>
            </div>

            <form onSubmit={handleSearch} className="relative col-span-2 row-start-2 lg:col-span-1 lg:row-auto">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar productos"
                className="h-10 w-full rounded-2xl border border-[#bdd8ff] bg-[#f7f9fd] pl-12 pr-4 font-semibold text-slate-800 outline-none shadow-[0_5px_16px_rgba(0,0,0,0.18)] transition placeholder:text-slate-500 focus:border-[#36a3ff] focus:bg-white focus:shadow-[0_0_0_3px_rgba(31,144,255,0.22)]"
              />
            </form>

            <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:gap-3">
              <div
                className="relative order-2"
                onMouseEnter={() => setIsCartPreviewOpen(true)}
                onMouseLeave={() => setIsCartPreviewOpen(false)}
                onFocus={() => setIsCartPreviewOpen(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsCartPreviewOpen(false);
                  }
                }}
              >
                <NavLink
                  to="/cart"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-transparent text-white transition hover:border-[#278dff]/60 hover:bg-[#0b2b65] hover:shadow-[0_0_16px_rgba(36,143,255,0.42)] sm:h-10 sm:w-10"
                  aria-label={`Carrito, ${cartItemsCount} productos`}
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--brand-orange)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(255,138,0,0.32)]">
                      {cartItemsCount}
                    </span>
                  )}
                </NavLink>

                {isCartPreviewOpen && (
                  <div className="absolute right-0 top-full z-30 hidden w-80 pt-2 lg:block">
                    <div className="rounded-2xl border border-[var(--nav-blue-border)] bg-white p-4 shadow-[0_24px_60px_rgba(18,60,105,0.16)]">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="m-0 text-lg font-black text-slate-950">
                        Tu carrito
                      </h3>
                      <span className="text-sm font-bold text-slate-400">
                        {cartItemsCount} item{cartItemsCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    {cart.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
                        Todavía no agregaste productos.
                      </p>
                    ) : (
                      <>
                        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                          {cart.map((item) => (
                            <article
                              key={item.id ?? `${item.product.id}-${item.variant?.id ?? ""}`}
                              className="flex gap-3 rounded-xl bg-slate-50 p-3"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-slate-900">
                                  {item.product.title}
                                </p>
                                {formatVariantLabel(item.variant) && (
                                  <p className="truncate text-xs font-bold text-slate-400">
                                    {formatVariantLabel(item.variant)}
                                  </p>
                                )}
                                <p className="text-sm font-semibold text-slate-500">
                                  $
                                  {(
                                    getCartItemUnitPrice(item) * item.quantity
                                  ).toLocaleString("es-AR")}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                                    Cantidad
                                  </span>
                                  <div className="flex h-8 items-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <button
                                      type="button"
                                      onClick={() => void handleCartItemQuantity(item, item.quantity - 1)}
                                      disabled={!item.id || updatingCartItemId === item.id}
                                      aria-label={`Quitar una unidad de ${item.product.title}`}
                                      className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                    <input
                                      key={`${item.id}-${item.quantity}`}
                                      type="number"
                                      min="1"
                                      defaultValue={item.quantity}
                                      onBlur={(event) => {
                                        const nextQuantity = Number.parseInt(event.currentTarget.value, 10);
                                        if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
                                          event.currentTarget.value = String(item.quantity);
                                          return;
                                        }
                                        void handleCartItemQuantity(item, nextQuantity);
                                      }}
                                      onKeyDown={(event) => {
                                        if (event.key === "Enter") event.currentTarget.blur();
                                      }}
                                      disabled={!item.id || updatingCartItemId === item.id}
                                      aria-label={`Cantidad de ${item.product.title}`}
                                      className="h-full w-10 border-x border-slate-200 bg-white text-center text-xs font-black text-slate-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => void handleCartItemQuantity(item, item.quantity + 1)}
                                      disabled={!item.id || updatingCartItemId === item.id}
                                      aria-label={`Agregar una unidad de ${item.product.title}`}
                                      className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => void handleRemoveCartItem(item)}
                                disabled={!item.id || updatingCartItemId === item.id}
                                aria-label={`Eliminar ${item.product.title}`}
                                title="Eliminar todas las unidades"
                                className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </article>
                          ))}
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="font-bold text-slate-500">
                              Total
                            </span>
                            <strong className="text-xl text-[var(--brand)]">
                              ${cartTotal.toLocaleString("es-AR")}
                            </strong>
                          </div>

                          <NavLink
                            to="/checkout"
                            onClick={() => setIsCartPreviewOpen(false)}
                            className="block rounded-xl bg-[var(--brand)] px-4 py-3 text-center font-bold text-white shadow-[0_12px_24px_rgba(45,0,107,0.20)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)]"
                          >
                            Ir a pagar
                          </NavLink>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
                )}
              </div>

              {user ? (
                <div className="relative order-1">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((current) => !current)}
                    className="flex h-9 items-center gap-2 rounded-xl border border-white/18 bg-white/12 px-2 font-bold text-white backdrop-blur-xl transition hover:border-cyan-200/70 hover:bg-white/18 sm:h-10 sm:px-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/22 text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                      <User size={18} strokeWidth={2.6} />
                    </span>
                    <span className="hidden max-w-36 truncate md:block">
                      {user.name ?? user.email ?? "Perfil"}
                    </span>
                    <span className="text-xs sm:text-sm md:hidden">Perfil</span>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        onClick={() => setIsUserMenuOpen(false)}
                        className="fixed inset-0 z-10"
                      />

                      <div className="absolute right-0 z-20 mt-3 w-64 rounded-2xl border border-[var(--nav-blue-border)] bg-white p-3 shadow-[0_24px_60px_rgba(18,60,105,0.16)]">
                        <p className="px-3 py-2 text-sm font-semibold text-slate-500">
                          {user.email ?? "Sesión activa"}
                        </p>

                        <NavLink
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Mi perfil
                        </NavLink>

                        <NavLink
                          to="/products/create"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <PackagePlus size={18} />
                          Vender
                        </NavLink>

                        <NavLink
                          to="/profile/payment-methods"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <CreditCard size={18} />
                          Medios de pago
                        </NavLink>

                        <NavLink
                          to="/profile/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <ShoppingBag size={18} />
                          Mis compras
                        </NavLink>

                        <NavLink
                          to="/profile/sales"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <ShoppingBag size={18} />
                          Mis ventas
                        </NavLink>

                        <NavLink
                          to="/profile/shipments"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <Truck size={18} />
                          Mis envíos
                        </NavLink>

                        <button
                          onClick={handleLogout}
                          className="w-full rounded-xl px-3 py-2 text-left font-bold text-red-600 hover:bg-red-50"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="order-1 flex items-center gap-1.5 sm:gap-2">
                  <NavLink to="/login" className="flex h-9 items-center rounded-xl border border-[#6385bd] bg-transparent px-2 text-[11px] font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-[#4ba8ff] hover:bg-[#0a2455] hover:shadow-[0_0_14px_rgba(35,139,255,0.30)] sm:h-10 sm:px-4 sm:text-sm">
                    Iniciar sesión
                  </NavLink>
                  <NavLink to="/register" className="flex h-9 items-center rounded-xl border border-[#1c70df] bg-[#074aaa] px-2 text-[11px] font-black text-white shadow-[0_0_16px_rgba(10,80,190,0.38)] transition hover:bg-[#0959c6] hover:shadow-[0_0_20px_rgba(25,107,222,0.48)] sm:h-10 sm:px-4 sm:text-sm">
                    Registrarse
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          <div className="relative flex items-center gap-1 border-t border-white/10 py-1 sm:gap-2">
            {user && selectedAddress && (
              <div className="relative shrink-0 sm:ml-[52px]">
                <button
                  type="button"
                  onClick={() => setIsAddressDropdownOpen((current) => !current)}
                  className="flex min-w-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-black leading-4 text-[var(--nav-blue)] shadow-[0_0_14px_rgba(7,24,50,0.45)] transition hover:bg-cyan-50"
                  aria-label="Cambiar dirección de envío"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-[9px] font-black uppercase leading-3 tracking-wide text-[var(--nav-blue)]/60">
                      Envío a
                    </span>
                    <span className="block max-w-28 truncate text-xs leading-4 sm:max-w-36">
                      {formatShortUserAddress(selectedAddress)}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-[var(--nav-blue)]/60 transition ${isAddressDropdownOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {isAddressDropdownOpen && (
                  <>
                    <div
                      onClick={() => setIsAddressDropdownOpen(false)}
                      className="fixed inset-0 z-10"
                    />
                    <div className="absolute left-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[var(--nav-blue-border)] bg-white p-1.5 shadow-[0_24px_60px_rgba(18,60,105,0.16)]">
                      <p className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-400">
                        Enviar a
                      </p>
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => handleSelectAddress(address.id)}
                          className="flex w-full items-start gap-2 rounded-lg px-3 py-1.5 text-left transition hover:bg-slate-50"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-800">
                              {address.label}
                            </span>
                            <span className="block truncate text-xs font-semibold text-slate-500">
                              {formatUserAddress(address)}
                            </span>
                          </span>
                          {address.id === selectedAddressId && (
                            <span
                              className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full bg-[var(--brand)] shadow-[0_4px_10px_rgba(45,0,107,0.25)]"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ))}

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={handleOpenAddressModal}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]"
                      >
                        <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Agregar direccion nueva
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <nav
              aria-label="Categorías principales de productos"
              className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {priorityCategories.map((category) => (
                <NavLink
                  key={category.id}
                  to={`/products?category=${encodeURIComponent(category.id)}`}
                  className={({ isActive }) => {
                    const isSelected =
                      isActive && currentSearchParams.get("category") === category.id;

                    return `shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold leading-4 text-white transition sm:px-3 sm:text-sm ${
                      isSelected
                        ? "border-[#2584de] bg-[#0751ad] shadow-[0_0_16px_rgba(24,103,204,0.62),inset_0_0_8px_rgba(255,255,255,0.14)]"
                        : "border-[#1765b8] bg-[#071a4b] shadow-[0_0_12px_rgba(28,125,234,0.34),inset_0_0_7px_rgba(36,132,255,0.16)] hover:border-[#43b8ff] hover:bg-[#0a2b68] hover:shadow-[0_0_17px_rgba(40,157,255,0.56)]"
                    }`;
                  }}
                >
                  {category.name}
                </NavLink>
              ))}
            </nav>

            <NavLink
              to="/products"
              className="shrink-0 rounded-full border border-[#b9d8ff] bg-[#f7faff] px-2.5 py-1 text-xs font-black leading-4 text-[#061d4d] shadow-[0_0_14px_rgba(92,174,255,0.35)] transition hover:border-white hover:bg-white hover:shadow-[0_0_19px_rgba(107,190,255,0.55)] sm:px-3 sm:text-sm"
            >
              Ver más
            </NavLink>
          </div>
        </div>
      </header>

      <main
        className={
          isAuthPage
            ? "w-full flex-1"
            : isCreateProductPage
              ? "w-full flex-1"
              : "mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
        }
      >
        <Outlet />
      </main>
      <footer
        className={`${isAuthPage || isCategoryCatalogPage ? "hidden" : ""} mt-auto border-t backdrop-blur-xl ${
          isProfilePage
            ? "border-[#eae0fa] bg-[#f8f5ff]"
            : location.pathname === "/"
              ? "border-[#d5eafa] bg-[#eff8ff] [&_h3]:text-[#0754b8] [&_p]:text-[#315f91]"
              : "border-[var(--brand-sky-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.90),rgba(231,248,255,0.86)_48%,rgba(255,241,216,0.82))]"
        }`}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <NavLink to="/" className="flex items-center gap-3">
              <img
                src="/BuyMarketLogoWeb.png"
                alt="BuyMarket"
                className="h-11 w-11 rounded-2xl object-contain"
              />
              <span className="text-2xl font-black text-[var(--nav-blue)]">
                BuyMarket
              </span>
            </NavLink>
            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-500">
              Una plataforma para comprar, vender y descubrir productos con una experiencia moderna, simple y confiable.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">
              Marketplace
            </h3>
            <div className="mt-4 grid gap-3 text-sm font-bold text-slate-500">
              <NavLink to="/products" className="transition hover:text-[var(--brand)]">
                Productos
              </NavLink>
              <NavLink to="/products/create" className="transition hover:text-[var(--brand)]">
                Vender
              </NavLink>
              <NavLink to="/cart" className="transition hover:text-[var(--brand)]">
                Carrito
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">
              Cuenta
            </h3>
            <div className="mt-4 grid gap-3 text-sm font-bold text-slate-500">
              <NavLink to="/login" className="transition hover:text-[var(--brand)]">
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className="transition hover:text-[var(--brand)]">
                Registrarse
              </NavLink>
              <NavLink to="/profile" className="transition hover:text-[var(--brand)]">
                Mi perfil
              </NavLink>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">
              Contacto
            </h3>
            <div className="mt-4 grid gap-3 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                soporte@buymarket.com
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Argentina
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-5 text-center text-sm font-semibold text-slate-500">
          © {new Date().getFullYear()} BuyMarket. Todos los derechos reservados.
        </div>
      </footer>

      {isAddressModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseAddressModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-address-modal-title"
              className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="m-0 text-sm font-black uppercase tracking-wide text-[var(--brand)]">
                    Direccion de envio
                  </p>
                  <h2
                    id="new-address-modal-title"
                    className="m-0 mt-1 text-2xl font-black text-slate-950"
                  >
                    Agregar direccion nueva
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCloseAddressModal}
                  aria-label="Cerrar formulario de nueva direccion"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
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

                <div className="flex gap-3 sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleCloseAddressModal}
                    className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={isSavingAddress}
                    className="flex-1 rounded-xl bg-[var(--brand)] px-5 py-3 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[#BBA7E8]"
                  >
                    {isSavingAddress ? "Guardando..." : "Guardar direccion"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default MainLayout;
