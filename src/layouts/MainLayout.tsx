import { Menu, Search, ShoppingBag, ShoppingCart, Truck, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CART_CHANGE_EVENT, getCart } from "../features/cart/store/cartStore";
import type { CartItem } from "../shared/types/Cart";
import { getUserFromToken, logout } from "../shared/utils/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "font-bold text-[var(--nav-blue)]"
    : "font-bold text-slate-700 transition hover:text-[var(--nav-blue-hover)]";

function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(getUserFromToken());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
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
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  function closeMenu() {
    setIsOpen(false);
  }

  function handleLogout() {
    logout();
    setUser(null);
    setIsUserMenuOpen(false);
    setIsOpen(false);
    navigate("/login");
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchTerm.trim();

    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setIsOpen(false);
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)]">
      <header className="sticky top-0 z-40 border-b border-[var(--nav-blue-border)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(234,244,255,0.92))] shadow-[0_10px_30px_rgba(18,60,105,0.08)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 py-4 lg:grid-cols-[auto_minmax(280px,1fr)_auto] lg:items-center">
            <div className="flex items-center justify-between gap-4">
              <NavLink to="/" className="text-2xl font-black text-[var(--nav-blue)] sm:text-3xl">
                BuyMarket
              </NavLink>

              <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--nav-blue-border)] bg-white/80 text-[var(--nav-blue)] lg:hidden"
                aria-label="Abrir menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar productos"
                className="h-12 w-full rounded-2xl border border-[var(--nav-blue-border)] bg-white/78 pl-12 pr-4 font-semibold text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--nav-blue-hover)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(15,94,156,0.12)]"
              />
            </form>

            <div className="hidden items-center justify-end gap-3 lg:flex">
              <div
                className="relative"
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
                  className="relative flex h-12 items-center gap-2 rounded-2xl border border-[var(--nav-blue-border)] bg-white/86 px-4 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[var(--nav-blue-hover)] hover:text-[var(--nav-blue)] hover:shadow-[0_12px_24px_rgba(18,60,105,0.12)]"
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  Carrito
                  {cartItemsCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--brand)] px-2 text-xs font-black text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </NavLink>

                {isCartPreviewOpen && (
                  <div className="absolute right-0 top-full z-30 w-80 pt-2">
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
                        Todavia no agregaste productos.
                      </p>
                    ) : (
                      <>
                        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                          {cart.map((item) => (
                            <article
                              key={item.product.id}
                              className="flex gap-3 rounded-xl bg-slate-50 p-3"
                            >
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-[var(--brand)]">
                                x{item.quantity}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-slate-900">
                                  {item.product.title}
                                </p>
                                <p className="text-sm font-semibold text-slate-500">
                                  $
                                  {(
                                    item.product.price * item.quantity
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((current) => !current)}
                    className="flex h-12 items-center gap-3 rounded-2xl border border-[var(--nav-blue-border)] bg-white/86 px-4 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[var(--nav-blue-hover)] hover:shadow-[0_12px_24px_rgba(18,60,105,0.12)]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--nav-blue-soft)] text-[var(--nav-blue)]">
                      <User size={18} />
                    </span>
                    <span className="max-w-36 truncate">
                      {user.name ?? user.email ?? "Perfil"}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div
                        onClick={() => setIsUserMenuOpen(false)}
                        className="fixed inset-0 z-10"
                      />

                      <div className="absolute right-0 z-20 mt-3 w-65 rounded-2xl border border-[var(--nav-blue-border)] bg-white p-3 shadow-[0_24px_60px_rgba(18,60,105,0.16)]">
                        <p className="px-3 py-2 text-sm font-semibold text-slate-500">
                          {user.email ?? "Sesion activa"}
                        </p>

                        <NavLink
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block rounded-xl px-3 py-2 font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Mi perfil
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
                          Cerrar sesion
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <NavLink
                  to="/login"
                  className="flex h-12 items-center gap-2 rounded-2xl border border-[var(--nav-blue-border)] bg-white/86 px-4 font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-[var(--nav-blue-hover)] hover:text-[var(--nav-blue)] hover:shadow-[0_12px_24px_rgba(18,60,105,0.12)]"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  Perfil
                </NavLink>
              )}
            </div>
          </div>

          <nav className="hidden items-center justify-center gap-8 border-t border-[rgba(18,60,105,0.10)] py-3 text-sm font-bold lg:flex">
            <NavLink to="/" className={navLinkClass} end>
              Inicio
            </NavLink>
            <NavLink to="/products" className={navLinkClass} end>
              Productos
            </NavLink>
            <NavLink to="/products/create" className={navLinkClass}>
              Vender
            </NavLink>
            {user && (
              <NavLink to="/profile/shipments" className={navLinkClass}>
                Envíos
              </NavLink>
            )}
            {!user && (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Iniciar sesion
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Registrarse
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {isOpen && (
          <div className="border-t border-[var(--nav-blue-border)] bg-white/95 lg:hidden">
            <div className="flex flex-col gap-4 px-4 py-5 text-base font-bold text-slate-700 sm:px-6">
              <NavLink to="/" onClick={closeMenu} className={navLinkClass} end>
                Inicio
              </NavLink>
              <NavLink to="/products" onClick={closeMenu} className={navLinkClass} end>
                Productos
              </NavLink>
              <NavLink to="/products/create" onClick={closeMenu} className={navLinkClass}>
                Vender
              </NavLink>
              <NavLink to="/cart" onClick={closeMenu} className={navLinkClass}>
                Carrito
              </NavLink>

              {user ? (
                <>
                  <p className="text-sm font-semibold text-slate-500">
                    {user.name ?? user.email ?? "Usuario"}
                  </p>
                  <NavLink to="/profile" onClick={closeMenu} className={navLinkClass}>
                    Mi perfil
                  </NavLink>
                  <NavLink
                    to="/profile/orders"
                    onClick={closeMenu}
                    className={navLinkClass}
                  >
                    Mis compras
                  </NavLink>
                  <NavLink
                    to="/profile/shipments"
                    onClick={closeMenu}
                    className={navLinkClass}
                  >
                    Envíos
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-left font-bold text-red-600 hover:text-red-700"
                  >
                    Cerrar sesion
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={closeMenu} className={navLinkClass}>
                    Iniciar sesion
                  </NavLink>
                  <NavLink to="/register" onClick={closeMenu} className={navLinkClass}>
                    Registrarse
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
