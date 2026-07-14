import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AtSign,
  Camera,
  Check,
  Copy,
  MessageCircle,
  Share2,
  Users,
  X,
} from "lucide-react";

type ShareProductModalProps = {
  productId: string;
  productTitle: string;
  isOpen: boolean;
  onClose: () => void;
};

function ShareProductModal({
  productId,
  productTitle,
  isOpen,
  onClose,
}: ShareProductModalProps) {
  const [status, setStatus] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  const productUrl = `${window.location.origin}/products/${productId}`;
  const shareText = `Mirá ${productTitle} en BuyMarket.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n${productUrl}`
  )}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    productUrl
  )}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(productUrl)}`;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
        setStatus("");
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [isOpen]);

  useEffect(() => {
    if (!status) return;

    const timeoutId = window.setTimeout(() => setStatus(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  if (!isOpen) return null;

  async function copyProductUrl(successMessage = "Enlace copiado al portapapeles.") {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API is not available");
    }

    await navigator.clipboard.writeText(productUrl);
    setStatus(successMessage);
  }

  async function handleCopy() {
    try {
      await copyProductUrl();
    } catch {
      setStatus("No se pudo copiar el enlace.");
    }
  }

  async function handleNativeShare() {
    setStatus("");

    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: shareText,
          url: productUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await copyProductUrl(
        "Enlace copiado. Abrí Instagram u otra app y pegalo para compartir."
      );
    } catch {
      setStatus("No se pudo abrir el menú ni copiar el enlace.");
    }
  }

  function handleClose() {
    setStatus("");
    onClose();
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) handleClose();
  }

  const isSuccess = status.startsWith("Enlace copiado");

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`share-product-title-${productId}`}
        className="w-full max-w-lg rounded-3xl border border-white/80 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 text-sm font-black uppercase tracking-wide text-[var(--brand)]">
              Compartir producto
            </p>
            <h2
              id={`share-product-title-${productId}`}
              className="m-0 mt-1 break-words text-2xl font-black text-slate-950"
            >
              {productTitle}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Cerrar opciones para compartir"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-soft)]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex min-w-0 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
          <input
            type="text"
            value={productUrl}
            readOnly
            aria-label="Enlace del producto"
            onFocus={(event) => event.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-slate-600 outline-none"
          />
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[var(--brand)] px-3 py-2 text-sm font-black text-white transition hover:bg-[var(--brand-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-soft)]"
          >
            {isSuccess ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            Copiar
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-3 py-4 text-center font-black text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100"
          >
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
            WhatsApp
          </a>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-blue-50 px-3 py-4 text-center font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <Users className="h-6 w-6" aria-hidden="true" />
            Facebook
          </a>
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-4 text-center font-black text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
          >
            <AtSign className="h-6 w-6" aria-hidden="true" />
            X
          </a>
          <button
            type="button"
            onClick={() => void handleNativeShare()}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-fuchsia-50 px-3 py-4 text-center font-black text-fuchsia-700 transition hover:-translate-y-0.5 hover:bg-fuchsia-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-100"
          >
            <span className="flex items-center gap-1" aria-hidden="true">
              <Camera className="h-6 w-6" />
              <Share2 className="h-4 w-4" />
            </span>
            Instagram y más
          </button>
        </div>

        <p className="mt-3 text-center text-xs font-semibold text-slate-500">
          Instagram aparecerá si está disponible en el menú de tu dispositivo.
        </p>

        {status && (
          <p
            className={`mt-4 rounded-xl px-3 py-2 text-center text-sm font-bold ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
            role="status"
            aria-live="polite"
          >
            {status}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

export default ShareProductModal;
