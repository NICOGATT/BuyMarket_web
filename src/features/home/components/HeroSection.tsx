import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
} from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

const brandAds = [
  {
    name: "RPM",
    category: "Ropa para mascotas",
    accent: "from-red-100 to-red-200",
    logo: "/brands/rpm-logo-white.png",
  },
  {
    name: "RPro",
    category: "Ropa profesional",
    accent: "from-emerald-100 to-orange-100",
    logo: "/brands/rpro-logo-white.png",
  },
  {
    name: "Samsung",
    category: "Tecnología",
    accent: "from-blue-500 to-violet-500",
    logo: undefined,
  },
  {
    name: "Apple",
    category: "Dispositivos",
    accent: "from-slate-100 to-slate-300",
    logo: undefined,
  },
  {
    name: "Nike",
    category: "Moda urbana",
    accent: "from-orange-400 to-orange-600",
    logo: undefined,
  },
  {
    name: "Sony",
    category: "Audio y gaming",
    accent: "from-blue-500 to-indigo-700",
    logo: undefined,
  },
  {
    name: "LG",
    category: "Hogar",
    accent: "from-pink-400 to-rose-600",
    logo: undefined,
  },
  {
    name: "Adidas",
    category: "Deportes",
    accent: "from-cyan-400 to-teal-600",
    logo: undefined,
  },
];

const brandAdCarousel = [...brandAds, ...brandAds];

const benefits = [
  { icon: ShieldCheck, text: "Compra segura" },
  { icon: BadgeCheck, text: "Vendedores verificados" },
  { icon: PackageCheck, text: "Envíos y retiro" },
  { icon: Tag, text: "Las mejores ofertas" },
  { icon: Search, text: "Comprá fácil y rápido" },
  { icon: Star, text: "Marcas confiables" },
];

function HeroSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const moveCarousel = (direction: number) => {
    carouselRef.current?.scrollBy({
      left: direction * Math.max(carouselRef.current.clientWidth * 0.75, 220),
      behavior: "smooth",
    });
  };

  return (
    <section className="relative left-1/2 isolate -mt-5 w-screen -translate-x-1/2 overflow-hidden bg-[#eaf5ff] text-[#07183c] sm:-mt-8">
      <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[#b9dcff]/70" />
      <div className="pointer-events-none absolute -right-20 -top-36 h-80 w-80 rounded-full bg-[#a8dbff]/70" />
      <div className="pointer-events-none absolute bottom-12 left-[42%] h-44 w-44 rounded-full bg-[#d7d9ff]/45 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:linear-gradient(135deg,transparent_0%,transparent_46%,rgba(255,255,255,0.8)_46%,rgba(255,255,255,0.8)_52%,transparent_52%,transparent_100%)] [background-size:720px_720px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="grid min-w-0 items-start gap-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(500px,1.08fr)] lg:gap-9">
          <div className="min-w-0 max-w-2xl">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#075bc7] shadow-[0_5px_18px_rgba(30,100,180,0.10)] backdrop-blur sm:px-4 sm:text-xs">
              <Sparkles className="h-4 w-4 shrink-0 fill-blue-500 text-blue-500" />
              <span className="truncate">
                La forma más rápida de comprar y vender online en Argentina
              </span>
            </span>

            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.04em] text-[#07183c] sm:text-5xl lg:text-[3.35rem]">
              Todo lo que buscás, en una experiencia{" "}
              <span className="text-[#087af2]">más rápida y confiable.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-600 sm:text-base sm:leading-7">
              <strong className="font-black text-[#075bc7]">BuyMarket</strong>{" "}
              conecta productos, vendedores verificados y compras simples en una
              plataforma pensada para descubrir, comparar y vender sin fricción.
            </p>

            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                to="/products"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white bg-white px-5 py-3 font-black text-[#075bc7] shadow-[0_12px_28px_rgba(41,99,158,0.12)] transition hover:-translate-y-0.5 hover:border-blue-200 sm:w-auto"
              >
                <ShoppingBag className="h-5 w-5" />
                Explorar productos
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/products/create"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#087af2] px-6 py-3 font-black text-white shadow-[0_14px_30px_rgba(8,122,242,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0668d2] sm:w-auto"
              >
                <Store className="h-5 w-5" />
                Vender ahora
              </Link>
            </div>
          </div>

          <div className="relative -mt-3 min-w-0 pt-0 sm:-mt-6 lg:-mt-9">
            <div className="pointer-events-none relative z-20 mx-auto -mb-16 h-36 w-full sm:-mb-20 sm:h-44 lg:-mb-24 lg:h-48">
              <img
                src="/hero/products/headphones.png"
                alt="Auriculares plateados"
                className="absolute bottom-1 left-[5%] h-[76%] w-[31%] -rotate-6 object-contain drop-shadow-[0_20px_16px_rgba(29,69,111,0.28)]"
              />
              <img
                src="/hero/products/smartphone.png"
                alt="Celular"
                className="absolute bottom-0 left-1/2 h-[88%] w-[25%] -translate-x-1/2 rotate-[8deg] object-contain drop-shadow-[0_22px_18px_rgba(23,51,84,0.30)]"
              />
              <img
                src="/hero/products/controller.png"
                alt="Joystick"
                className="absolute bottom-1 right-[3%] h-[66%] w-[34%] rotate-[5deg] object-contain drop-shadow-[0_20px_16px_rgba(29,69,111,0.27)]"
              />
            </div>

            <div className="relative z-10 rounded-[2rem] border border-white/90 bg-white/75 p-3 pt-12 shadow-[0_22px_55px_rgba(46,104,164,0.17)] backdrop-blur-xl sm:p-4 sm:pt-16">
              <button
                type="button"
                onClick={() => moveCarousel(-1)}
                aria-label="Ver marcas anteriores"
                className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white text-[#087af2] shadow-lg transition hover:scale-105 hover:bg-blue-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div
                ref={carouselRef}
                className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="brand-ad-carousel flex w-max gap-2 pr-2">
                {brandAdCarousel.map((brand, index) => (
                  <Link
                    key={`${brand.name}-${index}`}
                    to={`/products?brand=${encodeURIComponent(brand.name)}`}
                    className="group w-36 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_22px_rgba(34,79,126,0.09)] transition hover:-translate-y-1 sm:w-40"
                  >
                    <span
                      className={`flex h-24 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${brand.accent} text-xl font-black text-white sm:h-28`}
                    >
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={`Logo de ${brand.name}`}
                          className="h-full w-full bg-white object-contain p-3"
                          loading="lazy"
                        />
                      ) : (
                        <span className={brand.name === "Apple" ? "text-slate-700" : ""}>
                          {brand.name.toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="block px-3 pt-3 text-base font-black text-[#07183c]">
                      {brand.name}
                    </span>
                    <span className="block truncate px-3 pt-0.5 text-xs font-semibold text-slate-500">
                      {brand.category}
                    </span>
                    <span className="mx-3 mb-3 mt-3 inline-flex rounded-full bg-[#087af2] px-3 py-1.5 text-[11px] font-black text-white transition group-hover:bg-[#0668d2]">
                      Ver ofertas
                    </span>
                  </Link>
                ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => moveCarousel(1)}
                aria-label="Ver más marcas"
                className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white text-[#087af2] shadow-lg transition hover:scale-105 hover:bg-blue-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {benefits.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex min-h-16 items-center gap-3 rounded-xl border border-white bg-white/80 px-3 py-2.5 text-xs font-black text-[#07183c] shadow-[0_8px_22px_rgba(46,104,164,0.09)] backdrop-blur sm:text-sm"
            >
              <Icon className="h-6 w-6 shrink-0 text-[#087af2]" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
