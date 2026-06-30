function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[var(--brand-border)] bg-white px-6 py-14 text-center shadow-[0_28px_90px_rgba(45,0,107,0.12)] sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(45,0,107,0.10)] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />

      <span className="relative inline-flex rounded-full bg-[var(--brand-soft)] px-4 py-2 text-sm font-bold text-[var(--brand)]">
        Marketplace moderno
      </span>

      <h1 className="relative mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
        Compra y vende productos cerca tuyo de manera simple.
      </h1>

      <p className="relative mx-auto mt-6 max-w-2xl text-lg font-medium text-[var(--text-muted)]">
        BuyMarket conecta vendedores y compradores en una plataforma moderna,
        rapida y segura.
      </p>

      <div className="relative mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        <button className="rounded-xl bg-[var(--brand)] px-6 py-3 font-bold text-white shadow-[0_16px_34px_rgba(45,0,107,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)]">
          Explorar productos
        </button>
        <button className="rounded-xl border border-[var(--brand-border)] bg-white px-6 py-3 font-bold text-[var(--brand)] transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]">
          Vender ahora
        </button>
      </div>
    </div>
  );
}

export default HeroSection;
