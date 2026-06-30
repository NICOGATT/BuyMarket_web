import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addCart, isAuthRequiredError } from "../../cart/store/cartStore";
import type { Category } from "../../../shared/types/Category";
import type { Product, ProductCardProps } from "../../../shared/types/Product";

function ProductCard({
  id,
  title,
  description,
  price,
  image,
  categoryName,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const navigate = useNavigate();

  function buildCartProduct(): Product {
    return {
      id,
      title,
      description,
      price,
      images: image ? [image] : [],
      stock: 0,
      category: "" as unknown as Category,
      isActive: true,
      owner: "",
    };
  }

  async function handleAddToCart() {
    try {
      setIsAddingToCart(true);
      await addCart(buildCartProduct());
      alert("Producto agregado al carrito");
    } catch (error) {
      if (isAuthRequiredError(error)) {
        alert("Inicia sesion para agregar productos al carrito.");
        navigate("/login");
        return;
      }

      alert("No se pudo agregar el producto al carrito.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  async function handleBuyNow() {
    try {
      setIsBuyingNow(true);
      await addCart(buildCartProduct());
      navigate("/checkout");
    } catch (error) {
      if (isAuthRequiredError(error)) {
        alert("Inicia sesion para comprar.");
        navigate("/login");
        return;
      }

      alert("No se pudo preparar tu compra.");
    } finally {
      setIsBuyingNow(false);
    }
  }

  return (
    <article className="w-55 overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-[0_22px_55px_rgba(45,0,107,0.14)]">
      {isBuyingNow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-xl">
            <p className="text-lg font-black text-slate-950">
              Se esta preparando tu compra
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Estamos agregando el producto al carrito...
            </p>
          </div>
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--brand-border)] bg-[#F8F4FF]">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex min-h-56 flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-xl font-black text-[var(--text-main)]">
          {title}
        </h3>

        <p className="mt-2 text-sm font-bold text-[var(--brand)]">
          {categoryName || "Sin categoria"}
        </p>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          Para ver los detalles del producto, apreta el boton Ver detalles.
        </p>

        <div className="mt-auto pt-3">
          <span className="text-2xl font-black text-[var(--brand)]">
            ${price.toLocaleString("es-AR")}
          </span>

          <div className="mt-4 grid gap-3">
            <Link
              to={`/products/${id}`}
              className="flex items-center justify-center rounded-xl bg-[var(--text-main)] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)]"
            >
              Ver detalles
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || isBuyingNow}
              className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(45,0,107,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAddingToCart ? "Agregando..." : "Agregar al carrito"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isAddingToCart || isBuyingNow}
              className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isBuyingNow ? "Preparando..." : "Comprar ahora"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
