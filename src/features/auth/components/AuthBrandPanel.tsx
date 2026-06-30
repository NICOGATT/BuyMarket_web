import { BadgeCheck, MapPin, PackageCheck, ShoppingBag, Sparkles, Store } from "lucide-react";
import { Link } from "react-router-dom";

type AuthBrandPanelProps = {
  mode: "login" | "register";
};

const content = {
  login: {
    eyebrow: "Marketplace local",
    title: "BuyMarket",
    headline: "Comprá y vendé cerca tuyo en una plataforma simple.",
    description:
      "Encontrá productos de tu zona, conectá con vendedores reales y resolvé tus compras sin vueltas.",
  },
  register: {
    eyebrow: "Empezá hoy",
    title: "BuyMarket",
    headline: "Creá tu cuenta y convertí lo que tenés en oportunidades.",
    description:
      "Publicá productos, llegá a compradores cercanos y gestioná ventas desde un solo lugar.",
  },
};

function AuthBrandPanel({ mode }: AuthBrandPanelProps) {
  const copy = content[mode];

  return (
    <aside className="relative hidden min-h-[620px] overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,var(--nav-blue),#142B78_48%,var(--brand)_100%)] p-10 text-white shadow-[0_30px_90px_rgba(18,60,105,0.28)] lg:flex lg:flex-col lg:justify-between">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/14 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-sky-300/18 blur-3xl" />
        <div className="absolute left-12 top-1/2 h-40 w-40 rounded-full bg-[#D8C7FF]/16 blur-2xl" />

        <div className="absolute right-12 top-24 flex h-16 w-16 rotate-6 items-center justify-center rounded-3xl border border-white/18 bg-white/12 backdrop-blur">
          <PackageCheck className="h-7 w-7" />
        </div>
        <div className="absolute bottom-36 right-20 flex h-14 w-14 -rotate-12 items-center justify-center rounded-2xl border border-white/18 bg-white/10 backdrop-blur">
          <MapPin className="h-6 w-6" />
        </div>
        <div className="absolute bottom-24 left-16 flex h-16 w-16 rotate-12 items-center justify-center rounded-3xl border border-white/18 bg-white/12 backdrop-blur">
          <Store className="h-7 w-7" />
        </div>
      </div>

      <div className="relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-3 rounded-full bg-white/10 px-3 py-2 font-black text-white ring-1 ring-white/18 backdrop-blur transition hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--nav-blue)] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="text-2xl tracking-normal">{copy.title}</span>
        </Link>

        <div className="mt-14 max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-black uppercase text-sky-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.eyebrow}
          </span>
          <h2 className="mt-5 text-4xl font-black leading-tight !text-white">
            {copy.headline}
          </h2>
          <p className="mt-4 text-lg font-medium leading-8 text-white">
            {copy.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 grid gap-3">
        <div className="rounded-3xl border border-white/14 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-sky-200" aria-hidden="true" />
            <div>
              <p className="m-0 font-black text-white">Todo en un solo lugar</p>
              <p className="m-0 mt-1 text-sm font-medium text-white/68">
                Compras, publicaciones y seguimiento desde una experiencia clara.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AuthBrandPanel;
