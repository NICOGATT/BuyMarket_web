import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

const brandAds = [
  {
    name: "Samsung",
    category: "Tecnologia",
    accent: "from-sky-300 to-blue-600",
  },
  {
    name: "Apple",
    category: "Dispositivos",
    accent: "from-slate-200 to-slate-500",
  },
  {
    name: "Nike",
    category: "Moda urbana",
    accent: "from-orange-300 to-orange-600",
  },
  {
    name: "Sony",
    category: "Audio y gaming",
    accent: "from-violet-300 to-indigo-600",
  },
  {
    name: "LG",
    category: "Hogar",
    accent: "from-pink-300 to-rose-600",
  },
  {
    name: "Adidas",
    category: "Deportes",
    accent: "from-cyan-300 to-teal-600",
  },
];

const brandAdCarousel = [...brandAds, ...brandAds];

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
            Todo lo que buscas, en una experiencia mas rapida y confiable.
          </h1>

          <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-blue-50/86 sm:mt-6 sm:text-lg sm:leading-8">
            BuyMarket conecta productos, vendedores verificados y compras simples
            en una plataforma pensada para descubrir, comparar y vender sin friccion.
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
              { icon: PackageCheck, text: "Envios y retiro" },
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
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/14 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.20)] backdrop-blur-2xl sm:rounded-[30px] sm:py-6 lg:absolute lg:inset-x-8 lg:top-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(34,199,243,0.20),transparent_34%),radial-gradient(circle_at_92%_10%,rgba(255,138,0,0.22),transparent_32%)]" />

            <div className="relative overflow-hidden">
              <div className="brand-ad-carousel flex w-max gap-4 px-5">
              {brandAdCarousel.map((brand, index) => (
                <Link
                  key={`${brand.name}-${index}`}
                  to={`/products?search=${encodeURIComponent(brand.name)}`}
                  className="group w-44 shrink-0 rounded-3xl border border-white/18 bg-white/90 p-3 text-[var(--text-main)] shadow-[0_16px_38px_rgba(0,0,0,0.14)] transition hover:-translate-y-1 hover:bg-white sm:w-52"
                >
                  <span
                    className={`mb-3 flex h-28 w-full items-center justify-center rounded-2xl bg-gradient-to-br ${brand.accent} text-3xl font-black text-white shadow-sm sm:h-32`}
                  >
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="block truncate text-xl font-black">
                    {brand.name}
                  </span>
                  <span className="mt-1 block truncate text-sm font-semibold text-slate-500">
                    {brand.category}
                  </span>
                  <span className="mt-4 inline-flex rounded-2xl bg-[var(--brand-orange)] px-4 py-2 text-sm font-black text-white transition group-hover:bg-[var(--brand-orange-hover)]">
                    Ver ofertas
                  </span>
                </Link>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
