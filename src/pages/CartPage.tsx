import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CartItem } from "../shared/types/Cart";
import {
  clearCart,
  getCart,
  isAuthRequiredError,
  removeCartItem,
  updateCartItem,
} from "../features/cart/store/cartStore";

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
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

  const total = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  async function handleUpdateQuantity(item: CartItem, quantity: number) {
    if (!item.id || quantity < 1) return;

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
    return <p className="text-slate-500">Cargando carrito...</p>;
  }

  if (error) {
    return <p className="font-semibold text-red-500">{error}</p>;
  }

  if (cart.length === 0) {
    return (
      <section className="items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10">
        <h1 className="text-2xl font-black text-slate-900">
          Tu carrito esta vacio
        </h1>
        <p className="mt-2 text-slate-500">
          Agrega productos para iniciar una compra.
        </p>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-220px)] flex-col">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="m-0 text-4xl font-black text-slate-950">Carrito</h1>
        <button
          type="button"
          onClick={handleClearCart}
          className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:bg-red-100"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="space-y-4">
        {cart.map((item) => (
          <article
            key={item.id ?? item.product.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-xl font-black text-slate-900">
                {item.product.title}
              </h2>

              <p className="text-slate-500">
                ${item.product.price.toLocaleString("es-AR")} por unidad
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                disabled={!item.id || item.quantity <= 1 || updatingItemId === item.id}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                -
              </button>
              <span className="min-w-8 text-center font-black">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                disabled={!item.id || updatingItemId === item.id}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>

              <strong className="min-w-28 text-right text-xl text-blue-600">
                ${(item.product.price * item.quantity).toLocaleString("es-AR")}
              </strong>

              <button
                type="button"
                onClick={() => handleRemoveItem(item)}
                disabled={!item.id || updatingItemId === item.id}
                className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-auto rounded-2xl bg-slate-950 p-6 text-white">
        <Link
          to="/checkout"
          className="mb-5 block rounded-xl bg-blue-600 px-6 py-4 text-center font-bold text-white transition hover:bg-blue-700"
        >
          Ir a pagar
        </Link>

        <div className="border-t border-white/10 pt-5">
          <p className="text-lg">Total</p>
          <strong className="text-3xl">${total.toLocaleString("es-AR")}</strong>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
