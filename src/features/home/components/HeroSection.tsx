import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

const floatingProducts = [
  {
    title: "Notebook Pro",
    price: "$1.250.000",
    accent: "from-cyan-400 to-blue-600",
    position: "right-3 top-10 rotate-3 xl:right-8 xl:top-16",
  },
  {
    title: "Auriculares Max",
    price: "$89.900",
    accent: "from-violet-400 to-fuchsia-600",
    position: "left-0 bottom-12 -rotate-6 xl:left-2",
  },
  {
    title: "Smartwatch",
    price: "$145.000",
    accent: "from-sky-300 to-indigo-500",
    position: "right-12 bottom-4 -rotate-2 xl:right-20 xl:bottom-10",
  },
];

function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_16%_12%,rgba(125,211,252,0.45),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(168,85,247,0.36),transparent_30%),linear-gradient(135deg,#071832_0%,#123C69_42%,#2D006B_100%)] px-4 py-7 text-white shadow-[0_34px_100px_rgba(18,60,105,0.24)] sm:rounded-[32px] sm:px-8 sm:py-9 lg:px-12 lg:py-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14),transparent_38%,rgba(255,255,255,0.08))]" />

      <div className="relative grid min-w-0 items-center gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:gap-10">
        <div className="min-w-0 max-w-2xl">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-2 text-xs font-bold text-cyan-50 shadow-sm backdrop-blur-xl sm:px-4 sm:text-sm">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Marketplace argentino para comprar y vender mejor
            </span>
          </span>

          <h1 className="mt-6 max-w-3xl text-3xl font-black leading-[1.06] text-white sm:mt-7 sm:text-5xl lg:text-6xl">
            Todo lo que buscás, en una experiencia más rápida y confiable.
          </h1>

          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-blue-50/86 sm:mt-6 sm:text-lg sm:leading-8">
            BuyMarket conecta productos, vendedores verificados y compras simples
            en una plataforma pensada para descubrir, comparar y vender sin fricción.
          </p>

          <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-black text-[var(--nav-blue)] shadow-[0_18px_40px_rgba(255,255,255,0.18)] transition hover:-translate-y-1 hover:bg-cyan-50 sm:w-auto sm:px-6"
            >
              Explorar productos
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/products/create"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/24 bg-white/12 px-5 py-3.5 font-black text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/20 sm:w-auto sm:px-6"
            >
              <Store className="h-5 w-5" />
              Vender ahora
            </Link>
          </div>

          <div className="mt-7 grid gap-3 text-sm font-bold text-blue-50/90 sm:mt-8 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, text: "Compra segura" },
              { icon: BadgeCheck, text: "Vendedores verificados" },
              { icon: PackageCheck, text: "Envíos y retiro" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/14 bg-white/10 px-3 py-3 backdrop-blur-xl"
              >
                <Icon className="h-5 w-5 shrink-0 text-cyan-200" />
                <span className="truncate sm:whitespace-normal">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-w-0 lg:min-h-[430px]">
          <div className="relative rounded-2xl border border-white/20 bg-white/14 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:rounded-[30px] sm:p-4 lg:absolute lg:inset-x-8 lg:top-8">
            <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-slate-500 shadow-sm">
              <Search className="h-5 w-5 shrink-0 text-[var(--nav-blue)]" />
              <span className="truncate font-bold">
                Buscar celulares, muebles, gaming...
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
              {["Tecnología", "Hogar", "Moda", "Deportes"].map((item) => (
                <div
                  key={item}
                  className="min-w-0 rounded-2xl bg-white/88 p-3 text-[var(--text-main)] shadow-sm sm:p-4"
                >
                  <div className="mb-3 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 via-white to-violet-100 sm:mb-4 sm:h-20" />
                  <p className="truncate font-black">{item}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-500 sm:text-sm">
                    Ofertas activas
                  </p>
                </div>
              ))}
            </div>
          </div>

          {floatingProducts.map((product) => (
            <div
              key={product.title}
              className={`absolute hidden w-40 rounded-3xl border border-white/24 bg-white/18 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition hover:-translate-y-1 md:block xl:w-48 ${product.position}`}
            >
              <div
                className={`h-20 rounded-2xl bg-gradient-to-br xl:h-24 ${product.accent}`}
              />
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
