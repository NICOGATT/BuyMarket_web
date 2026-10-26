import { Link, useLocation } from "react-router-dom";
import { useOrderPaymentConfirmation } from "../shared/hooks/useOrderPaymentConfirmation";

const returnContent = {
  success: {
    title: "Pago recibido",
    message:
      "El proveedor de pago nos avisara el estado final de la operacion. Si el pago fue aprobado, la orden se actualiza automaticamente.",
    className: "border-green-200 bg-green-50 text-green-900",
    buttonClassName: "bg-green-700 hover:bg-green-800",
  },
  failure: {
    title: "Pago no completado",
    message:
      "La compra quedo sin pago confirmado. Podes volver a productos o revisar el estado desde tu perfil.",
    className: "border-red-200 bg-red-50 text-red-900",
    buttonClassName: "bg-red-700 hover:bg-red-800",
  },
  pending: {
    title: "Pago pendiente",
    message:
      "El proveedor esta procesando el pago. La orden se actualizara cuando llegue la confirmacion.",
    className: "border-amber-200 bg-amber-50 text-amber-900",
    buttonClassName: "bg-amber-700 hover:bg-amber-800",
  },
} as const;

type CheckoutReturnStatus = keyof typeof returnContent;

type CheckoutReturnPageProps = {
  status: CheckoutReturnStatus;
};

function CheckoutReturnPage({ status }: CheckoutReturnPageProps) {
  const location = useLocation();
  const content = returnContent[status];
  const searchParams = new URLSearchParams(location.search);
  const paymentId = searchParams.get("payment_id");
  const orderId = searchParams.get("orderId");
  // Con orderId (pago con tarjeta) no se da por pagado: se confirma contra la orden.
  const confirmation = useOrderPaymentConfirmation(
    status === "success" ? orderId : null
  );
  const isOrderPayment = !!orderId && status === "success";
  const isConfirmed = isOrderPayment && confirmation.state === "paid";
  const isConfirming = isOrderPayment && confirmation.state === "confirming";
  const isUnconfirmed = isOrderPayment && confirmation.state === "unconfirmed";

  const title = isConfirmed
    ? "Pago aprobado"
    : isConfirming
      ? "Estamos confirmando tu pago"
      : isUnconfirmed
        ? "Todavía no pudimos confirmar tu pago"
        : content.title;
  const message = isConfirmed
    ? `Confirmamos el pago de la orden #${orderId?.slice(0, 8)}.`
    : isConfirming
      ? "Esto puede tardar unos segundos. No cierres esta página."
      : isUnconfirmed
        ? "Si ya pagaste, la orden se actualizará apenas recibamos la confirmación. Podés revisar el estado en Mis compras."
        : content.message;

  return (
    <section
      className={`mx-auto max-w-2xl rounded-3xl border p-8 ${content.className}`}
    >
      <h1 className="m-0 text-3xl font-black">{title}</h1>
      <p className="mt-3 font-semibold">{message}</p>

      {paymentId && (
        <p className="mt-4 rounded-xl bg-white/70 p-3 text-sm font-bold">
          Pago #{paymentId}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/products"
          className={`rounded-xl px-5 py-3 font-bold text-white transition ${content.buttonClassName}`}
        >
          Ver productos
        </Link>
        <Link
          to={orderId ? "/profile/orders" : "/profile"}
          className="rounded-xl bg-white px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-100"
        >
          {orderId ? "Ver mis compras" : "Ir a mi perfil"}
        </Link>
      </div>
    </section>
  );
}

export default CheckoutReturnPage;
