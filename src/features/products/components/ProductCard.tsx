import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Share2, ShoppingCart, X, Zap } from "lucide-react";
import {
  addCart,
  addProductToCart,
  isAuthRequiredError,
} from "../../cart/store/cartStore";
import type { ProductCardProps } from "../../../shared/types/Product";
import { getProductCategoryName } from "../../../shared/utils/productCategories";
import { getProductMediaItems } from "../../../shared/utils/productImages";
import {
  getDisplayPrice,
  getVariantTotalStock,
  hasProductVariants,
} from "../../../shared/utils/productVariants";
import ShareProductModal from "./ShareProductModal";
import VariantPickerModal from "./VariantPickerModal";

function ProductCard({
  product,
  badge = "Destacado",
  compact = false,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false);
  const [isCartSuccessVisible, setIsCartSuccessVisible] = useState(false);
  const [variantPickerKey, setVariantPickerKey] = useState(0);
  const [variantPickerMode, setVariantPickerMode] = useState<"cart" | "buy">(
    "cart"
  );
  const navigate = useNavigate();
  const coverMedia = getProductMediaItems(product)[0];
  const categoryName = getProductCategoryName(product);
  const hasVariants = hasProductVariants(product);
  const displayPrice = getDisplayPrice(product);
  const totalVariantStock = getVariantTotalStock(product);

  useEffect(() => {
    if (!isCartSuccessVisible) return;

    const timeoutId = window.setTimeout(() => {
      setIsCartSuccessVisible(false);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [isCartSuccessVisible]);

  function showCartSuccess() {
    setIsCartSuccessVisible(false);
    window.setTimeout(() => setIsCartSuccessVisible(true), 0);
  }

  function openVariantPicker(mode: "cart" | "buy") {
    setVariantPickerMode(mode);
    setVariantPickerKey((key) => key + 1);
    setIsVariantPickerOpen(true);
  }

  async function handleAddToCart() {
    if (hasVariants) {
      openVariantPicker("cart");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addCart(product);
      showCartSuccess();
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
      openVariantPicker("buy");
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

  async function handleVariantConfirm(variantId: string) {
    setIsVariantPickerOpen(false);

    const isBuy = variantPickerMode === "buy";

    try {
      if (isBuy) {
        setIsBuyingNow(true);
      } else {
        setIsAddingToCart(true);
      }

      await addProductToCart({
        productId: product.id,
        variantId,
        quantity: 1,
      });

      if (isBuy) {
        navigate("/checkout");
      } else {
        showCartSuccess();
      }
    } catch (error) {
      if (isAuthRequiredError(error)) {
        alert(
          isBuy
            ? "Inicia sesion para comprar."
            : "Inicia sesion para agregar productos al carrito."
        );
        navigate("/login");
        return;
      }

      alert(
        isBuy
          ? "No se pudo preparar tu compra."
          : "No se pudo agregar el producto al carrito."
      );
    } finally {
      setIsBuyingNow(false);
      setIsAddingToCart(false);
    }
  }

  return (
    <article className={`group flex h-full w-full flex-col overflow-hidden border border-white/80 bg-white/90 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-sky-border)] ${compact ? "rounded-2xl shadow-[0_8px_22px_rgba(18,60,105,0.08)] hover:shadow-[0_14px_30px_rgba(18,60,105,0.13)]" : "rounded-3xl shadow-[0_12px_34px_rgba(18,60,105,0.08)] hover:shadow-[0_24px_70px_rgba(18,60,105,0.16)]"}`}>
      {isCartSuccessVisible &&
        createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-24 z-[70] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-[#bce8d3] bg-white shadow-[0_22px_55px_rgba(8,45,83,0.22)] sm:right-6"
        >
          <div className="h-1.5 bg-[linear-gradient(90deg,#087af2,#14b86e)]" />
          <div className="flex items-start gap-3 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f9f0] text-[#079455]">
              <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="m-0 text-base font-black text-[#07183c]">
                ¡Producto agregado!
              </p>
              <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-slate-500">
                {product.title} ya está en tu carrito.
              </p>
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="mt-2 text-sm font-black text-[#0754b8] transition hover:text-[#087af2] hover:underline"
              >
                Ver mi carrito
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCartSuccessVisible(false)}
              aria-label="Cerrar notificación"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>,
          document.body
        )}

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

      <ShareProductModal
        productId={product.id}
        productTitle={product.title}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <VariantPickerModal
        key={variantPickerKey}
        product={product}
        isOpen={isVariantPickerOpen}
        mode={variantPickerMode}
        onClose={() => setIsVariantPickerOpen(false)}
        onConfirm={handleVariantConfirm}
      />

      <div className={`relative overflow-hidden border-b border-white/70 bg-white ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          aria-label={`Compartir ${product.title}`}
          title="Compartir producto"
          className={`absolute z-10 flex items-center justify-center text-[var(--nav-blue-hover)] transition hover:-translate-y-0.5 hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-soft)] ${compact ? "right-2 top-2 h-8 w-8" : "right-4 top-4 h-11 w-11"}`}
        >
          <Share2 className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
        </button>
        {coverMedia ? (
          <Link
            to={`/products/${product.id}`}
            aria-label={`Ver ${product.title}`}
            className="block h-full w-full"
          >
            {coverMedia.type === "video" ? (
              <video
                src={coverMedia.url}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                aria-label={`Video de ${product.title}`}
              />
            ) : (
              <img
                src={coverMedia.url}
                alt={product.title}
                className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            )}
          </Link>
        ) : (
          <Link
            to={`/products/${product.id}`}
            aria-label={`Ver ${product.title}`}
            className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400"
          >
            Sin imagen
          </Link>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-3" : "min-h-72 p-5"}`}>
        <span className={`font-black text-[var(--nav-blue-hover)] ${compact ? "mb-1 text-[10px]" : "mb-1.5 text-xs"}`}>
          {badge}
        </span>

        <Link
          to={`/products/${product.id}`}
          className={`line-clamp-2 font-black leading-snug text-[var(--text-main)] transition hover:text-[var(--brand)] ${compact ? "text-sm" : "text-lg"}`}
        >
          {product.title}
        </Link>

        <p className={`w-fit rounded-full bg-[var(--brand-orange-soft)] font-black text-[var(--brand-hover)] ${compact ? "mt-1.5 px-2 py-0.5 text-[9px]" : "mt-2 px-3 py-1 text-xs"}`}>
          {categoryName || "Sin categoria"}
        </p>

        {!compact && (
          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">
            {product.description ||
              "Publicacion disponible para ver detalles, comparar y comprar."}
          </p>
        )}

        <div className={`mt-auto ${compact ? "pt-3" : "pt-5"}`}>
          <span className={`block font-black text-slate-950 ${compact ? "text-lg" : "text-2xl"}`}>
            {hasVariants ? "Desde " : ""}${displayPrice.toLocaleString("es-AR")}
          </span>
          {!compact && totalVariantStock !== null && (
            <span className="mt-1 block text-sm font-bold text-slate-500">
              Stock total: {totalVariantStock}
            </span>
          )}
          {!compact && (
            <span className="mt-1 block text-sm font-bold text-[var(--nav-blue-hover)]">
              Compra protegida
            </span>
          )}

          <div className={`grid ${compact ? "mt-2 gap-1.5" : "mt-4 gap-2"}`}>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAddingToCart || isBuyingNow}
              className={`flex items-center justify-center bg-[var(--brand)] font-black text-white shadow-[0_12px_24px_rgba(45,0,107,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60 ${compact ? "gap-1 rounded-xl px-2 py-2 text-[10px]" : "gap-2 rounded-2xl px-4 py-3 text-sm"}`}
            >
              <ShoppingCart className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              {isAddingToCart ? "Agregando..." : "Agregar al carrito"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isAddingToCart || isBuyingNow}
              className={`flex items-center justify-center bg-[var(--brand-orange)] font-black text-white shadow-[0_12px_24px_rgba(255,138,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-orange-hover)] disabled:cursor-not-allowed disabled:opacity-60 ${compact ? "gap-1 rounded-xl px-2 py-2 text-[10px]" : "gap-2 rounded-2xl px-4 py-3 text-sm"}`}
            >
              <Zap className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              {isBuyingNow ? "Preparando..." : "Comprar ahora"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
