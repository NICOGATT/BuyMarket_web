import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import type { CartItem } from "../shared/types/Cart";
import type { Category } from "../shared/types/Category";
import {
  clearCart,
  getCart,
  isAuthRequiredError,
  removeCartItem,
  updateCartItem,
} from "../features/cart/store/cartStore";
import { getCartItemUnitPrice } from "../shared/utils/productVariants";
import { getProductFirstImage } from "../shared/utils/productImages";
import { getCategories } from "../shared/services/category.service";

function getCartItemVariantDetails(item: CartItem) {
  const variantId = item.variant?.id ?? item.variantId;
  const productVariant = item.product.variants?.find(
    (variant) => variant.id === variantId
  );
  const size = item.variant?.size?.trim() || productVariant?.size?.trim() || "";
  const color =
    item.variant?.color?.trim() ||
    productVariant?.color?.trim() ||
    item.variant?.colorHex?.trim().toUpperCase() ||
    productVariant?.colorHex?.trim().toUpperCase() ||
    "";

  return { size, color };
}

const priorityCategoryAliases = [
  ["mascotas"],
  ["tecno", "tecnologia"],
  ["computacion"],
  ["indumentaria"],
  ["calzado", "calzados"],
  ["deco/bazar", "deco bazar", "deco y bazar"],
  ["belleza"],
  ["alimentos"],
  ["accesorios"],
  ["bebes"],
];

function normalizeCategoryName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]/g, "");
}

function getPriorityCategories(categories: Category[], limit = 8) {
  const usedIds = new Set<string>();
  const ordered: Category[] = [];

  priorityCategoryAliases.forEach((aliases) => {
    const match = categories.find(
      (category) =>
        !usedIds.has(category.id) &&
        aliases.some(
          (alias) => normalizeCategoryName(category.name) === normalizeCategoryName(alias)
        )
    );

    if (match) {
      usedIds.add(match.id);
      ordered.push(match);
    }
  });

  categories.forEach((category) => {
    if (!usedIds.has(category.id)) ordered.push(category);
  });

  return ordered.slice(0, limit);
}

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCart()
      .then((data) => {
        setCart(data);
      })
      .catch((loadError) => {
        if (isAuthRequiredError(loadError)) {
          navigate("/login");
          return;
        }

        setError("No se pudo cargar el carrito.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const total = cart.reduce(
    (acc, item) => acc + getCartItemUnitPrice(item) * item.quantity,
    0
  );
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const exploreCategories = getPriorityCategories(categories);

  async function handleUpdateQuantity(item: CartItem, quantity: number) {
    if (!item.id) return;

    if (quantity < 1) {
      await handleRemoveItem(item);
      return;
    }

    try {
      setUpdatingItemId(item.id);
      const data = await updateCartItem(item.id, { quantity });
      setCart(data);
    } catch (updateError) {
      if (isAuthRequiredError(updateError)) {
        navigate("/login");
        return;
      }

      alert("No se pudo actualizar la cantidad.");
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemoveItem(item: CartItem) {
    if (!item.id) return;

    try {
      setUpdatingItemId(item.id);
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
      setUpdatingItemId(null);
    }
  }

  async function handleClearCart() {
    try {
      await clearCart();
      setCart([]);
    } catch (clearError) {
      if (isAuthRequiredError(clearError)) {
        navigate("/login");
        return;
      }

      alert("No se pudo vaciar el carrito.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[32px] bg-[linear-gradient(135deg,#eff8ff,#ffffff_55%,#fff7eb)]">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <ShoppingCart className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="mt-4 font-bold text-slate-500">Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center font-bold text-red-600">
        {error}
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="relative -mt-3 overflow-hidden rounded-[32px] px-4 py-8 sm:-mt-5 sm:px-6 sm:py-12 lg:py-16">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#eaf6ff_0%,#ffffff_52%,#fff3e4_100%)]" />
        <div className="absolute -left-20 -top-24 -z-10 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 -z-10 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[440px] items-center justify-center rounded-[32px] border border-white/80 bg-white/80 px-6 py-12 shadow-[0_24px_70px_rgba(24,74,126,0.10)] backdrop-blur-xl">
            <div className="max-w-xl text-center">
              <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/60">
                <ShoppingCart className="h-11 w-11 text-[#087af2]" strokeWidth={1.8} aria-hidden="true" />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#07183c] sm:text-4xl">
                Tu carrito está vacío
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base font-medium leading-7 text-slate-500 sm:text-lg">
                Todavía no agregaste productos. Explorá el marketplace y encontrá algo que te guste.
              </p>

              <div className="mt-8 flex justify-center">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 rounded-xl bg-[#087af2] px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0754b8] hover:shadow-xl hover:shadow-blue-600/25"
                >
                  Explorar productos
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>

              {exploreCategories.length > 0 && (
                <div className="mt-9 border-t border-slate-100 pt-6">
                  <p className="mb-3 text-sm font-semibold text-slate-400">También podés explorar</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {exploreCategories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?category=${encodeURIComponent(category.id)}`}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative -mt-3 overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#edf7ff_0%,#ffffff_52%,#fff5e8_100%)] p-4 sm:-mt-5 sm:p-6 lg:p-8">
      <div className="absolute -left-20 top-16 h-60 w-60 rounded-full bg-blue-200/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-orange-200/25 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-[#0754b8] shadow-sm">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Tu compra
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#07183c] sm:text-4xl">
              Carrito de compras
            </h1>
            <p className="mt-2 font-semibold text-slate-500">
              {totalItems} {totalItems === 1 ? "producto" : "productos"} listo{totalItems === 1 ? "" : "s"} para comprar
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Vaciar carrito
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {cart.map((item) => {
              const { size, color } = getCartItemVariantDetails(item);
              const image = getProductFirstImage(item.product);
              const itemTotal = getCartItemUnitPrice(item) * item.quantity;
              const isUpdating = updatingItemId === item.id;

              return (
                <article
                  key={item.id ?? item.product.id}
                  className="rounded-3xl border border-white/90 bg-white/90 p-4 shadow-[0_16px_45px_rgba(24,74,126,0.09)] backdrop-blur sm:p-5"
                >
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                    <Link
                      to={`/products/${item.product.id}`}
                      className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white sm:w-28"
                    >
                      {image ? (
                        <img src={image} alt={item.product.title} className="h-full w-full object-contain p-2" />
                      ) : (
                        <PackageCheck className="h-9 w-9 text-slate-300" aria-hidden="true" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="line-clamp-2 text-lg font-black leading-snug text-slate-950 transition hover:text-[#0754b8]"
                      >
                        {item.product.title}
                      </Link>

                      {(size || color) && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                          {size && <span className="rounded-full bg-slate-100 px-3 py-1">Talle: {size}</span>}
                          {color && <span className="rounded-full bg-slate-100 px-3 py-1">Color: {color}</span>}
                        </div>
                      )}

                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        ${getCartItemUnitPrice(item).toLocaleString("es-AR")} por unidad
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <strong className="text-xl font-black text-[#0754b8]">
                        ${itemTotal.toLocaleString("es-AR")}
                      </strong>
                      <button
                        type="button"
                        onClick={() => void handleRemoveItem(item)}
                        disabled={!item.id || isUpdating}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-sm font-bold text-slate-500">Cantidad</span>
                    <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => void handleUpdateQuantity(item, item.quantity - 1)}
                        disabled={!item.id || isUpdating}
                        aria-label={`Quitar una unidad de ${item.product.title}`}
                        className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-[#0754b8] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
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
                          void handleUpdateQuantity(item, nextQuantity);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        disabled={!item.id || isUpdating}
                        aria-label={`Cantidad de ${item.product.title}`}
                        className="h-full w-12 border-x border-slate-200 bg-white text-center text-sm font-black text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleUpdateQuantity(item, item.quantity + 1)}
                        disabled={!item.id || isUpdating}
                        aria-label={`Agregar una unidad de ${item.product.title}`}
                        className="flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-[#0754b8] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <Link
              to="/products"
              className="group inline-flex items-center gap-2 px-2 py-2 text-sm font-black text-[#0754b8] transition hover:text-[#087af2]"
            >
              Seguir comprando
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <aside className="rounded-3xl border border-white/90 bg-white/95 p-5 shadow-[0_20px_55px_rgba(24,74,126,0.12)] backdrop-blur lg:sticky lg:top-32 sm:p-6">
            <h2 className="text-xl font-black text-[#07183c]">Resumen de compra</h2>

            <div className="mt-5 space-y-3 text-sm font-semibold text-slate-500">
              <div className="flex items-center justify-between gap-4">
                <span>Productos ({totalItems})</span>
                <span className="font-bold text-slate-800">${total.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Envío</span>
                <span className="font-bold text-[#079455]">A calcular</span>
              </div>
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="flex items-end justify-between gap-4">
              <span className="font-bold text-slate-600">Total</span>
              <strong className="text-3xl font-black tracking-tight text-[#07183c]">
                ${total.toLocaleString("es-AR")}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#087af2] px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-[#0754b8] hover:shadow-xl"
            >
              Continuar compra
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>

            <div className="mt-5 space-y-3 rounded-2xl bg-[#f4f9ff] p-4">
              <div className="flex items-center gap-3 text-sm font-bold text-[#25466f]">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#087af2]" aria-hidden="true" />
                Compra segura y protegida
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-[#25466f]">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-[#079455]" aria-hidden="true" />
                Podés revisar antes de pagar
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
