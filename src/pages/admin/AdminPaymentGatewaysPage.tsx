import PaymentGatewayToggleList from "../../features/paymentGateways/components/PaymentGatewayToggleList";

function AdminPaymentGatewaysPage() {
  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Pasarelas de pago
        </h1>

        <p className="mt-2 text-slate-500">
          Activá o desactivá los medios de pago online. Transferencia y
          efectivo siempre están disponibles.
        </p>
      </div>

      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
        <PaymentGatewayToggleList />
      </article>
    </section>
  );
}

export default AdminPaymentGatewaysPage;
