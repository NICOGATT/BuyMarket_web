import { Check, ShoppingCart, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Product, ProductVariant } from "../../../shared/types/Product";
import { getProductFirstImage } from "../../../shared/utils/productImages";
import {
  getDisplayPrice,
  getPurchasableVariants,
} from "../../../shared/utils/productVariants";

type VariantPickerModalProps = {
  product: Product;
  isOpen: boolean;
  mode: "cart" | "buy";
  onClose: () => void;
  onConfirm: (variantId: string) => void;
};

function getVariantColorLabel(variant: ProductVariant) {
  return (
    variant.color?.trim() ||
    variant.colorHex?.trim().toUpperCase() ||
    "Sin color"
  );
}

function getVariantColorSwatch(variant: ProductVariant) {
  return variant.colorHex?.trim() || "#e2e8f0";
}

function getVariantColorIdentity(variant: ProductVariant) {
  const color = variant.color?.trim().toLocaleLowerCase() || "";
  const colorHex = variant.colorHex?.trim().toLocaleLowerCase() || "";

  return `${color}|${colorHex}`;
}

function getSelectedVariantLabel(variant: ProductVariant) {
  return [variant.size, getVariantColorLabel(variant)]
    .filter(Boolean)
    .join(" / ");
}

function formatPrice(price: number) {
  return price.toLocaleString("es-AR");
}

function VariantPickerModal({
  product,
  isOpen,
  mode,
  onClose,
  onConfirm,
}: VariantPickerModalProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const image = getProductFirstImage(product);
  const purchasableVariants = useMemo(
    () => getPurchasableVariants(product),
    [product]
  );
  const hasPurchasableVariants = purchasableVariants.length > 0;

  const sizeOptions = useMemo(
    () => Array.from(new Set(purchasableVariants.map((variant) => variant.size))),
    [purchasableVariants]
  );

  const colorOptions = useMemo(() => {
    return purchasableVariants
      .filter((variant) => variant.size === selectedSize)
      .filter(
        (variant, index, variantsForSize) =>
          variantsForSize.findIndex(
            (item) =>
              getVariantColorIdentity(item) === getVariantColorIdentity(variant)
          ) === index
      );
  }, [purchasableVariants, selectedSize]);

  const selectedVariant =
    selectedSize && selectedVariantId
      ? purchasableVariants.find(
          (variant) =>
            variant.size === selectedSize && variant.id === selectedVariantId
        )
      : undefined;

  const displayedPrice = selectedVariant?.price ?? getDisplayPrice(product);
  const confirmLabel =
    mode === "buy" ? "Comprar ahora" : "Agregar al carrito";

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-picker-modal-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-white/80 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 text-sm font-black uppercase tracking-wide text-[var(--brand)]">
              Elegí tu variante
            </p>
            <h2
              id="variant-picker-modal-title"
              className="m-0 mt-1 line-clamp-2 break-words text-xl font-black leading-snug text-slate-950"
            >
              {product.title}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar selección de variante"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-soft)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {image ? (
            <img
              src={image}
              alt={product.title}
              className="h-16 w-16 shrink-0 rounded-xl border border-white bg-white object-contain p-1"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white bg-white text-xs font-bold text-slate-400">
              Sin imagen
            </span>
          )}
          <div className="min-w-0">
            <span className="block text-lg font-black text-slate-950">
              {selectedVariant ? "" : "Desde "}$
              {formatPrice(displayedPrice)}
            </span>
            {selectedVariant && (
              <span className="mt-0.5 block text-sm font-bold text-[var(--brand)]">
                {getSelectedVariantLabel(selectedVariant)}
              </span>
            )}
          </div>
        </div>

        {!hasPurchasableVariants ? (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-center font-semibold text-red-700">
            Este producto no tiene variantes con stock disponible.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 overflow-y-auto pr-1">
            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-700">
                Talle
              </span>
              <select
                value={selectedSize}
                onChange={(event) => {
                  setSelectedSize(event.target.value);
                  setSelectedVariantId("");
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold outline-none focus:border-[var(--brand)]"
              >
                <option value="">Elegir talle</option>
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-2 block text-sm font-black text-slate-700">
                Color
              </span>
              {selectedSize ? (
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;

                    return (
                      <button
                        key={
                          variant.id ??
                          `${variant.size}-${getVariantColorIdentity(variant)}`
                        }
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id ?? "")}
                        disabled={!variant.id}
                        className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 font-bold transition ${
                          isSelected
                            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                            : "border-slate-300 bg-white text-slate-700 hover:border-[var(--brand-border)] disabled:cursor-not-allowed disabled:opacity-60"
                        }`}
                      >
                        <span
                          className="h-6 w-6 rounded-full border border-slate-300"
                          style={{
                            backgroundColor: getVariantColorSwatch(variant),
                          }}
                          aria-hidden="true"
                        />
                        <span>{getVariantColorLabel(variant)}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-500">
                  Primero elegí talle
                </p>
              )}
            </div>

            {selectedVariant && (
              <p className="rounded-xl bg-slate-50 p-3 font-semibold text-slate-600">
                Seleccionado: {getSelectedVariantLabel(selectedVariant)} - $
                {formatPrice(selectedVariant.price)}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedVariant?.id) onConfirm(selectedVariant.id);
            }}
            disabled={!selectedVariant?.id}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-soft)] disabled:cursor-not-allowed disabled:opacity-60 ${
              mode === "buy"
                ? "bg-[var(--brand-orange)] shadow-[0_12px_24px_rgba(255,138,0,0.22)] hover:bg-[var(--brand-orange-hover)]"
                : "bg-[var(--brand)] shadow-[0_12px_24px_rgba(45,0,107,0.18)] hover:bg-[var(--brand-hover)]"
            }`}
          >
            {mode === "buy" ? (
              <Zap className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            )}
            {confirmLabel}
            {mode === "cart" && <Check className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default VariantPickerModal;
