import { Link, useLocation } from "react-router-dom";

const returnContent = {
  success: {
    title: "Pago recibido",
    message:
      "Mercado Pago nos avisara el estado final de la operacion. Si el pago fue aprobado, la orden se actualiza automaticamente.",
    className: "border-green-200 bg-green-50 text-green-900",
    buttonClassName: "bg-green-700 hover:bg-green-800",
  },
  failure: {
    title: "Pago no completado",
    message:
      "La compra quedo sin pago confirmado. Podes volver al carrito o intentar nuevamente desde Mercado Pago.",
    className: "border-red-200 bg-red-50 text-red-900",
    buttonClassName: "bg-red-700 hover:bg-red-800",
  },
  pending: {
    title: "Pago pendiente",
    message:
      "Mercado Pago esta procesando el pago. La orden se actualizara cuando llegue la confirmacion.",
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
  const paymentId = new URLSearchParams(location.search).get("payment_id");

  return (
    <section
      className={`mx-auto max-w-2xl rounded-3xl border p-8 ${content.className}`}
    >
      <h1 className="m-0 text-3xl font-black">{content.title}</h1>
      <p className="mt-3 font-semibold">{content.message}</p>

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
          to="/profile"
          className="rounded-xl bg-white px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-100"
        >
          Ir a mi perfil
        </Link>
      </div>
    </section>
  );
}

export default CheckoutReturnPage;
