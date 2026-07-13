import { CreditCard, Mail, MapPin, PackagePlus, Search, ShoppingBag, ShoppingCart, Truck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CART_CHANGE_EVENT, getCart } from "../features/cart/store/cartStore";
import type { CartItem } from "../shared/types/Cart";
import {
  formatVariantLabel,
  getCartItemUnitPrice,
} from "../shared/utils/productVariants";
import { getUserFromToken, logout } from "../shared/utils/auth";
import { getCategories } from "../shared/services/category.service";
import type { Category } from "../shared/types/Category";

function MainLayout() {
  const [user, setUser] = useState(getUserFromToken());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(window.location.search).get("search") ?? ""
  );
  const navigate = useNavigate();

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

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + getCartItemUnitPrice(item) * item.quantity,
    0
  );

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

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[radial-gradient(circle_at_86%_0%,rgba(255,138,0,0.26),transparent_28%),linear-gradient(135deg,rgba(7,24,50,0.96),rgba(18,60,105,0.92)_45%,rgba(45,0,107,0.90))] shadow-[0_18px_48px_rgba(7,24,50,0.22)] backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 sm:gap-4 sm:py-4 lg:grid-cols-[auto_minmax(280px,1fr)_auto]">
            <div className="flex items-center justify-between gap-4">
              <NavLink to="/" className="flex min-w-0 items-center gap-3">
                <img
                  src="/BuyMarketLogoWeb.png"
                  alt="BuyMarket"
                  className="h-10 w-10 rounded-2xl object-contain shadow-sm"
                />
                <span className="hidden truncate text-2xl font-black text-white sm:block sm:text-3xl">
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
                className="h-12 w-full rounded-2xl border border-white/18 bg-white/92 pl-12 pr-4 font-semibold text-[var(--text-main)] outline-none shadow-[0_12px_28px_rgba(0,0,0,0.10)] transition placeholder:text-[var(--text-muted)] focus:border-cyan-200 focus:bg-white focus:shadow-[0_0_0_4px_rgba(125,211,252,0.18)]"
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
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/18 bg-white/12 text-white backdrop-blur-xl transition hover:border-cyan-200/70 hover:bg-white/18 sm:h-12 sm:w-12 sm:rounded-2xl"
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
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-[var(--brand)]">
                                x{item.quantity}
                              </div>
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
                              </div>
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
                    className="flex h-10 items-center gap-2 rounded-xl border border-white/18 bg-white/12 px-2 font-bold text-white backdrop-blur-xl transition hover:border-cyan-200/70 hover:bg-white/18 sm:h-12 sm:rounded-2xl sm:px-4"
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
                  <NavLink to="/login" className="flex h-10 items-center rounded-xl border border-white/25 bg-white/12 px-2 text-[11px] font-bold text-white transition hover:border-cyan-200/70 hover:bg-white/18 sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm">
                    Iniciar sesión
                  </NavLink>
                  <NavLink to="/register" className="flex h-10 items-center rounded-xl bg-white px-2 text-[11px] font-black text-[var(--nav-blue)] shadow-sm transition hover:bg-cyan-50 sm:h-12 sm:rounded-2xl sm:px-4 sm:text-sm">
                    Registrarse
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          <nav aria-label="Categorías de productos" className="flex items-center justify-center gap-1 overflow-x-auto border-t border-white/10 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <NavLink
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.id)}`}
                className="shrink-0 rounded-full border border-white/14 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold leading-4 text-white/85 transition hover:border-cyan-200/70 hover:bg-white/18 hover:text-white sm:px-2 sm:text-[10px]"
              >
                {category.name}
              </NavLink>
            ))}
            <NavLink
              to="/products"
              className="sticky right-0 shrink-0 rounded-full bg-white px-2 py-0.5 text-[9px] font-black leading-4 text-[var(--nav-blue)] shadow-[0_0_14px_rgba(7,24,50,0.45)] transition hover:bg-cyan-50 sm:text-[10px]"
            >
              Ver más
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-[var(--brand-sky-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.90),rgba(231,248,255,0.86)_48%,rgba(255,241,216,0.82))] backdrop-blur-xl">
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
    </div>
  );
}

export default MainLayout;
