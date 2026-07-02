import { ArrowRight, BadgeCheck, PackageCheck, Search, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Link } from "react-router-dom";

const floatingProducts = [
  {
    title: "Notebook Pro",
    price: "$1.250.000",
    accent: "from-cyan-400 to-blue-600",
    position: "right-8 top-16 rotate-3",
  },
  {
    title: "Auriculares Max",
    price: "$89.900",
    accent: "from-violet-400 to-fuchsia-600",
    position: "left-2 bottom-12 -rotate-6",
  },
  {
    title: "Smartwatch",
    price: "$145.000",
    accent: "from-sky-300 to-indigo-500",
    position: "right-20 bottom-10 -rotate-2",
  },
];

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_16%_12%,rgba(125,211,252,0.55),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(168,85,247,0.42),transparent_30%),linear-gradient(135deg,#071832_0%,#123C69_42%,#2D006B_100%)] px-5 py-8 text-white shadow-[0_34px_100px_rgba(18,60,105,0.24)] sm:px-8 lg:px-12 lg:py-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16),transparent_38%,rgba(255,255,255,0.08))]" />
      <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-violet-400/24 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-bold text-cyan-50 shadow-sm backdrop-blur-xl">
            <Sparkles className="h-4 w-4" />
            Marketplace argentino para comprar y vender mejor
          </span>

          <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.02] text-white sm:text-5xl lg:text-6xl">
            Todo lo que buscás, en una experiencia más rápida y confiable.
          </h1>

          <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-blue-50/86 sm:text-lg">
            BuyMarket conecta productos, vendedores verificados y compras simples
            en una plataforma pensada para descubrir, comparar y vender sin fricción.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-black text-[var(--nav-blue)] shadow-[0_18px_40px_rgba(255,255,255,0.18)] transition hover:-translate-y-1 hover:bg-cyan-50"
            >
              Explorar productos
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/products/create"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/24 bg-white/12 px-6 py-3.5 font-black text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/20"
            >
              <Store className="h-5 w-5" />
              Vender ahora
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-sm font-bold text-blue-50/90 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, text: "Compra segura" },
              { icon: BadgeCheck, text: "Vendedores verificados" },
              { icon: PackageCheck, text: "Envíos y retiro" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-3 py-3 backdrop-blur-xl">
                <Icon className="h-5 w-5 text-cyan-200" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[430px]">
          <div className="absolute inset-x-4 top-8 rounded-[30px] border border-white/20 bg-white/14 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:inset-x-12 lg:inset-x-8">
            <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-500 shadow-sm">
              <Search className="h-5 w-5 text-[var(--nav-blue)]" />
              <span className="font-bold">Buscar celulares, muebles, gaming...</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {["Tecnología", "Hogar", "Moda", "Deportes"].map((item) => (
                <div key={item} className="rounded-2xl bg-white/88 p-4 text-[var(--text-main)] shadow-sm">
                  <div className="mb-4 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 via-white to-violet-100" />
                  <p className="font-black">{item}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Ofertas activas</p>
                </div>
              ))}
            </div>
          </div>

          {floatingProducts.map((product) => (
            <div
              key={product.title}
              className={`absolute hidden w-48 rounded-3xl border border-white/24 bg-white/18 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition hover:-translate-y-1 md:block ${product.position}`}
            >
              <div className={`h-24 rounded-2xl bg-gradient-to-br ${product.accent}`} />
              <p className="mt-3 truncate font-black text-white">{product.title}</p>
              <p className="text-sm font-bold text-cyan-100">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
