import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "qrcode";
import {
  createGetnetQrPayment,
  getPaymentCapabilities,
  uploadTransferProof,
} from "../shared/services/payment.service";
import type { GetnetQrPayment } from "../shared/services/payment.service";
import { getOrderById } from "../shared/services/order.service";
import type { Order } from "../shared/types/Order";
import {
  formatVariantLabel,
  getOrderItemUnitPrice,
} from "../shared/utils/productVariants";

const staticQrPath = "/qr-code.png";
const proofAcceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const proofMaxSize = 5 * 1024 * 1024;

async function requestQr(orderId: string) {
  const payment = await createGetnetQrPayment(orderId);
  const image = await QRCode.toDataURL(payment.qrPayload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 360,
  });

  return { payment, image };
}

function formatFileSize(size: number) {
  const megabytes = size / (1024 * 1024);
  return `${megabytes.toFixed(megabytes >= 1 ? 1 : 2)} MB`;
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
        Orden #{order.id.slice(0, 8)}
      </p>
      <h2 className="mt-1 text-xl font-black text-white">Resumen de compra</h2>

      <div className="mt-5 space-y-4">
        {order.items.map((item, index) => {
          const unitPrice = getOrderItemUnitPrice(item);
          const variantLabel = formatVariantLabel(item.variant);

          return (
            <article
              key={`${item.product.id}-${item.variant?.id ?? index}`}
              className="flex items-start justify-between gap-4 border-b border-white/10 pb-4"
            >
              <div className="min-w-0">
                <p className="break-words font-bold text-white">
                  {item.product.title}
                </p>
                {variantLabel && (
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {variantLabel}
                  </p>
                )}
                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {item.quantity} x ${unitPrice.toLocaleString("es-AR")}
                </p>
              </div>
              <strong className="shrink-0">
                ${(unitPrice * item.quantity).toLocaleString("es-AR")}
              </strong>
            </article>
          );
        })}
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="font-semibold text-slate-300">Total a pagar</p>
        <strong className="mt-1 block text-3xl text-white">
          ${Number(order.total).toLocaleString("es-AR")}
        </strong>
      </div>
    </aside>
  );
}

function GetnetQrCheckoutPage() {
  const { orderId = "" } = useParams();
  const [qrPayment, setQrPayment] = useState<GetnetQrPayment | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [qrImage, setQrImage] = useState("");
  const [now, setNow] = useState(0);
  const [isDynamicQr, setIsDynamicQr] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generateQr = useCallback(async () => {
    if (!orderId) return;

    try {
      setIsGenerating(true);
      setError("");
      const { payment, image } = await requestQr(orderId);
      setQrPayment(payment);
      setQrImage(image);
      setNow(Date.now());
    } catch {
      setError("No se pudo generar el QR de Getnet. Intentalo nuevamente.");
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    void Promise.all([
      getOrderById(orderId),
      getPaymentCapabilities().catch(() => ({ getnetQrEnabled: false })),
    ])
      .then(async ([loadedOrder, capabilities]) => {
        if (cancelled) return;

        setOrder(loadedOrder);
        setProofSubmitted(Boolean(loadedOrder.payment?.proofImageUrl));
        setIsDynamicQr(capabilities.getnetQrEnabled);

        if (capabilities.getnetQrEnabled) {
          const qrResult = await requestQr(orderId);
          if (cancelled) return;
          setQrPayment(qrResult.payment);
          setQrImage(qrResult.image);
          setNow(Date.now());
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudo cargar el pago de esta orden.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId || order?.status === "paid" || order?.status === "rejected") {
      return;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void getOrderById(orderId).then(setOrder).catch(() => undefined);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [orderId, order?.status]);

  useEffect(() => {
    if (!isDynamicQr) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [isDynamicQr]);

  const secondsRemaining = useMemo(() => {
    if (!qrPayment) return 0;
    return Math.max(
      0,
      Math.ceil((new Date(qrPayment.expiresAt).getTime() - now) / 1000)
    );
  }, [now, qrPayment]);
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  async function copyPayload() {
    if (!qrPayment) return;
    await navigator.clipboard.writeText(qrPayment.qrPayload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function handleProofSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!order?.payment?.id) {
      setError("No se encontró el pago asociado a la orden.");
      return;
    }

    if (!proofFile) {
      setError("Subí una imagen del comprobante para continuar.");
      return;
    }

    if (!proofAcceptedTypes.includes(proofFile.type)) {
      setError("El comprobante debe ser una imagen JPG, PNG o WebP.");
      return;
    }

    if (proofFile.size > proofMaxSize) {
      setError("El comprobante no puede superar los 5 MB.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");
      await uploadTransferProof(order.payment.id, proofFile);
      setProofSubmitted(true);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo enviar el comprobante. Intentalo nuevamente."
      );
    } finally {
      setIsUploading(false);
    }
  }

  if (!orderId) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-red-900">
          No se encontró la orden
        </h1>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
      </section>
    );
  }

  if (isLoading) {
    return <p className="text-slate-500">Preparando el pago con QR...</p>;
  }

  if (!order) {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-red-900">
          No pudimos cargar la orden
        </h1>
        <p className="mt-3 font-semibold text-red-700">
          {error || "Volvé a Mis compras para revisar el estado del pedido."}
        </p>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
      </section>
    );
  }

  if (order.status === "paid") {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-green-900">
          Pago aprobado
        </h1>
        <p className="mt-3 font-semibold text-green-700">
          Confirmamos el pago de la orden #{order.id.slice(0, 8)}.
        </p>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
      </section>
    );
  }

  if (order.status === "rejected") {
    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="m-0 text-3xl font-black text-red-900">
          Pago rechazado
        </h1>
        <p className="mt-3 font-semibold text-red-700">
          No pudimos aprobar el pago de esta orden.
        </p>
        <Link
          to="/profile/orders"
          className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-bold text-white"
        >
          Ver mis compras
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="m-0 text-3xl font-black text-slate-950">
          Pagá con cualquier billetera
        </h1>
        <p className="mt-3 font-semibold text-slate-600">
          Escaneá el código QR y completá el pago desde tu billetera.
        </p>

        {error && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 font-semibold text-red-700">
            {error}
          </p>
        )}

        {isDynamicQr ? (
          qrPayment && qrImage && secondsRemaining > 0 ? (
            <>
              <img
                src={qrImage}
                alt="QR interoperable para pagar la orden"
                className="mx-auto mt-6 w-full max-w-[360px]"
              />
              <p
                className="mt-3 text-center font-bold text-slate-700"
                aria-live="polite"
              >
                Vence en {minutes}:{seconds.toString().padStart(2, "0")}
              </p>
              <p className="mt-2 text-center text-3xl font-black text-slate-950">
                ${Number(order.total).toLocaleString("es-AR")}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void copyPayload()}
                  className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-800"
                >
                  {copied ? "Código copiado" : "Copiar código"}
                </button>
                <a
                  href={qrImage}
                  download={`getnet-qr-${orderId}.png`}
                  className="rounded-xl bg-[var(--brand)] px-4 py-3 text-center font-bold text-white"
                >
                  Descargar QR
                </a>
              </div>
              <p className="mt-5 text-center text-sm font-semibold text-slate-500">
                Esperando la confirmación segura de Getnet...
              </p>
            </>
          ) : (
            <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-center">
              <p className="font-bold text-amber-900">El código venció.</p>
              <button
                type="button"
                onClick={() => void generateQr()}
                disabled={isGenerating}
                className="mt-4 rounded-xl bg-amber-700 px-5 py-3 font-bold text-white disabled:opacity-60"
              >
                {isGenerating ? "Generando..." : "Generar otro QR"}
              </button>
            </div>
          )
        ) : (
          <>
            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(260px,360px)_1fr] xl:items-center">
              <div className="text-center">
                <img
                  src={staticQrPath}
                  alt="Código QR para pagar la orden"
                  className="mx-auto w-full max-w-[360px] rounded-2xl"
                />
                <a
                  href={staticQrPath}
                  download={`buymarket-qr-${order.id.slice(0, 8)}.png`}
                  className="mt-4 inline-flex rounded-xl border border-[var(--brand-border)] px-5 py-3 font-bold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]"
                >
                  Descargar QR
                </a>
              </div>

              <div>
                <p className="text-sm font-black uppercase text-[var(--brand)]">
                  Importe exacto
                </p>
                <strong className="mt-1 block text-4xl font-black text-slate-950">
                  ${Number(order.total).toLocaleString("es-AR")}
                </strong>
                <ol className="mt-5 space-y-3 font-semibold text-slate-700">
                  <li>1. Escaneá el QR desde tu billetera.</li>
                  <li>2. Ingresá exactamente el total indicado.</li>
                  <li>3. Guardá el comprobante y subilo debajo.</li>
                </ol>
                <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                  El pago no se confirma automáticamente. Revisaremos el monto y
                  el comprobante antes de aprobar la compra.
                </p>
              </div>
            </div>

            {proofSubmitted ? (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
                <h2 className="m-0 text-xl font-black text-green-900">
                  Pago en revisión
                </h2>
                <p className="mt-2 font-semibold text-green-700">
                  Recibimos tu comprobante. Te avisaremos cuando el pago sea
                  aprobado.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/profile/orders"
                    className="rounded-xl bg-green-700 px-5 py-3 text-center font-bold text-white"
                  >
                    Ver mis compras
                  </Link>
                  <Link
                    to="/products"
                    className="rounded-xl border border-green-300 px-5 py-3 text-center font-bold text-green-800"
                  >
                    Seguir comprando
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProofSubmit} className="mt-6">
                <label className="block">
                  <span className="mb-2 block font-bold text-slate-800">
                    Comprobante de pago
                  </span>
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setProofFile(file);

                      if (file && file.size > proofMaxSize) {
                        setError("El comprobante no puede superar los 5 MB.");
                        return;
                      }

                      if (file && !proofAcceptedTypes.includes(file.type)) {
                        setError(
                          "El comprobante debe ser una imagen JPG, PNG o WebP."
                        );
                        return;
                      }

                      setError("");
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--brand)]"
                  />
                  <span className="mt-2 block text-sm font-semibold text-slate-500">
                    Formatos permitidos: JPG, PNG o WebP. Máximo 5 MB.
                  </span>
                  {proofFile && (
                    <span className="mt-2 block rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                      {proofFile.name} ({formatFileSize(proofFile.size)})
                    </span>
                  )}
                </label>
                <button
                  disabled={isUploading}
                  className="mt-5 w-full rounded-xl bg-[var(--brand)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading
                    ? "Enviando comprobante..."
                    : "Enviar comprobante"}
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <OrderSummary order={order} />
    </section>
  );
}

export default GetnetQrCheckoutPage;
