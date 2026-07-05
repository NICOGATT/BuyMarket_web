import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, ShoppingCart, Zap } from "lucide-react";
import { addCart, isAuthRequiredError } from "../../cart/store/cartStore";
import type { ProductCardProps } from "../../../shared/types/Product";
import { getProductCategoryName } from "../../../shared/utils/productCategories";
import { getProductFirstImage } from "../../../shared/utils/productImages";
import {
  getDisplayPrice,
  getVariantTotalStock,
  hasProductVariants,
} from "../../../shared/utils/productVariants";

function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const navigate = useNavigate();
  const image = getProductFirstImage(product);
  const categoryName = getProductCategoryName(product);
  const hasVariants = hasProductVariants(product);
  const displayPrice = getDisplayPrice(product);
  const totalVariantStock = getVariantTotalStock(product);

  async function handleAddToCart() {
    if (hasVariants) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      setIsAddingToCart(true);
      await addCart(product);
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
    if (hasVariants) {
      navigate(`/products/${product.id}`);
      return;
    }

    try {
      setIsBuyingNow(true);
      await addCart(product);
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
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/86 shadow-[0_12px_34px_rgba(18,60,105,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-sky-border)] hover:shadow-[0_24px_70px_rgba(18,60,105,0.16)]">
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

      <div className="relative aspect-[4/3] overflow-hidden border-b border-white/70 bg-[radial-gradient(circle_at_18%_12%,rgba(34,199,243,0.22),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(255,138,0,0.22),transparent_32%),linear-gradient(135deg,#F8FBFF,#F5EFFF)]">
        <span className="absolute left-4 top-4 z-10 rounded-full bg-white/88 px-3 py-1 text-xs font-black text-[var(--brand)] shadow-sm backdrop-blur">
          Destacado
        </span>
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex min-h-72 flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-black leading-snug text-[var(--text-main)]">
          {product.title}
        </h3>

        <p className="mt-2 w-fit rounded-full bg-[var(--brand-orange-soft)] px-3 py-1 text-xs font-black text-[var(--brand-hover)]">
          {categoryName || "Sin categoria"}
        </p>

        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
          {product.description ||
            "Publicacion disponible para ver detalles, comparar y comprar."}
        </p>

        <div className="mt-auto pt-5">
          <span className="block text-2xl font-black text-slate-950">
            {hasVariants ? "Desde " : ""}${displayPrice.toLocaleString("es-AR")}
          </span>
          {totalVariantStock !== null && (
            <span className="mt-1 block text-sm font-bold text-slate-500">
              Stock total: {totalVariantStock}
            </span>
          )}
          <span className="mt-1 block text-sm font-bold text-[var(--nav-blue-hover)]">
            Compra protegida
          </span>

          <div className="mt-4 grid gap-2">
            <Link
              to={`/products/${product.id}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--nav-blue)] px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[var(--nav-blue-hover)]"
            >
              <Eye className="h-4 w-4" />
              Ver detalles
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart || isBuyingNow}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(45,0,107,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart className="h-4 w-4" />
              {hasVariants
                ? "Elegir variante"
                : isAddingToCart
                  ? "Agregando..."
                  : "Agregar al carrito"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isAddingToCart || isBuyingNow}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-orange)] px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,138,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-orange-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Zap className="h-4 w-4" />
              {hasVariants
                ? "Ver opciones"
                : isBuyingNow
                  ? "Preparando..."
                  : "Comprar ahora"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
