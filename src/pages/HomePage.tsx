import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import HeroSection from "../features/home/components/HeroSection";
import { normalizeName } from "../features/products/categoryConfig";
import FeaturedProducts from "../features/products/components/FeaturedProducts";
import { getCategories } from "../shared/services/category.service";
import type { Category } from "../shared/types/Category";
import {
  getCategoryDisplayImageUrls,
  getCategoryInitials,
} from "../shared/utils/categoryImages";

const benefits = [
  {
    title: "Compra segura",
    description:
      "Flujos claros para sumar productos al carrito, revisar tu compra y avanzar al checkout.",
    icon: ShieldCheck,
  },
  {
    title: "Vendedores verificados",
    description:
      "Perfiles y publicaciones pensadas para que puedas comprar con más contexto.",
    icon: BadgeCheck,
  },
  {
    title: "Envíos y retiros",
    description:
      "Seguimiento de compras, envíos y puntos de retiro desde tu cuenta.",
    icon: Truck,
  },
  {
    title: "Soporte cercano",
    description:
      "Una experiencia preparada para acompañarte antes y después de comprar.",
    icon: PackageCheck,
  },
];

const referenceCategoryOrder = [
  "indumentaria",
  "computacion",
  "mascotas",
  "tecno",
  "belleza",
  "calzados",
  "decobazar",
  "lenceria",
  "libreria",
  "videojuegos",
  "juguetes",
  "limpieza",
];

const referenceCategoryAliases: Record<string, string> = {
  calzado: "calzados",
  "deco/bazar": "decobazar",
};

const referenceIconPositions: Record<string, { left: number; top: number }> = {
  accesorios: { left: 0, top: 0 },
  alimentos: { left: -100, top: 0 },
  bebes: { left: -200, top: 0 },
  belleza: { left: -300, top: 0 },
  calzados: { left: -400, top: 0 },
  computacion: { left: 0, top: -100 },
  cotillon: { left: -100, top: -100 },
  decobazar: { left: -200, top: -100 },
  deportes: { left: -300, top: -100 },
  gimnasio: { left: -400, top: -100 },
};

const secondaryIconPositions: Record<string, { left: number; top: number }> = {
  indumentaria: { left: 0, top: 0 },
  jardineria: { left: -100, top: 0 },
  juguetes: { left: -200, top: 0 },
  lenceria: { left: -300, top: 0 },
  libreria: { left: -400, top: 0 },
  libros: { left: 0, top: -100 },
  limpieza: { left: -100, top: -100 },
  mascotas: { left: -200, top: -100 },
  suplementos: { left: -300, top: -100 },
  tecno: { left: -400, top: -100 },
  textiles: { left: 0, top: -200 },
  videojuegos: { left: -100, top: -200 },
};

function HomeCategoriesSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden lg:justify-between">
      {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
        <div
          key={item}
          className="w-[82px] shrink-0 animate-pulse text-center"
        >
          <div className="mx-auto h-[76px] w-[76px] rounded-full bg-white/80" />
          <div className="mx-auto mt-2 h-3 w-16 rounded-full bg-white/80" />
        </div>
      ))}
    </div>
  );
}

/*
function LegacyHomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageAttempts, setImageAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data.slice(0, 10));
      } catch {
        setError("No pudimos cargar las categorías.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  function handleCategoryImageError(categoryId: string) {
    setImageAttempts((current) => ({
      ...current,
      [categoryId]: (current[categoryId] ?? 0) + 1,
    }));
  }

  return (
    <section className="rounded-2xl border border-white/80 bg-[radial-gradient(circle_at_0%_0%,rgba(34,199,243,0.16),transparent_30%),radial-gradient(circle_at_100%_12%,rgba(255,138,0,0.15),transparent_30%),rgba(255,255,255,0.74)] p-4 shadow-[0_24px_70px_rgba(18,60,105,0.10)] backdrop-blur-xl sm:rounded-[32px] sm:p-7">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-sky-soft)] px-3 py-1 text-sm font-black text-[var(--nav-blue)]">
            <Sparkles className="h-4 w-4" />
            Explorá por categoría
          </span>
          <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
            Categorías
          </h2>
          <p className="mt-2 max-w-2xl font-semibold text-slate-500">
            Accesos rápidos a categorías reales de BuyMarket, con sus imágenes
            cargadas desde la base.
          </p>
        </div>
        <Link
          to="/products"
          className="font-black text-[var(--brand)] transition hover:text-[var(--brand-hover)]"
        >
          Ver productos
        </Link>
      </div>

      {isLoading && <HomeCategoriesSkeleton />}

      {!isLoading && error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </p>
      )}

      {!isLoading && !error && categories.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center font-semibold text-slate-500">
          Todavía no hay categorías disponibles.
        </p>
      )}

      {!isLoading && !error && categories.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => {
            const imageUrls = getCategoryDisplayImageUrls(category);
            const imageAttempt = imageAttempts[category.id] ?? 0;
            const imageUrl = imageUrls[imageAttempt];
            const shouldShowImage = Boolean(imageUrl);

            return (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group min-w-0 overflow-hidden rounded-2xl border border-white/80 bg-white/86 p-3 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-[var(--brand-sky-border)] hover:shadow-[0_18px_45px_rgba(18,60,105,0.14)] sm:rounded-3xl"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:h-24 sm:w-24">
                  {shouldShowImage ? (
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt={category.name}
                      onError={() => handleCategoryImageError(category.id)}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-white text-lg font-black text-[var(--brand)] shadow-sm">
                      {getCategoryInitials(category)}
                    </span>
                  )}
                </div>

                <div className="pt-3 text-center">
                  <span className="line-clamp-2 block text-sm font-black text-slate-950 sm:text-base">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-slate-500 sm:text-sm">
                    Ver categoría
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
*/

function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageAttempts, setImageAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        const orderedCategories = [...data].sort((first, second) => {
          const firstName = referenceCategoryAliases[normalizeName(first.name)] ?? normalizeName(first.name);
          const secondName = referenceCategoryAliases[normalizeName(second.name)] ?? normalizeName(second.name);
          const firstIndex = referenceCategoryOrder.indexOf(firstName);
          const secondIndex = referenceCategoryOrder.indexOf(secondName);

          return (firstIndex < 0 ? 99 : firstIndex) - (secondIndex < 0 ? 99 : secondIndex);
        });
        setCategories(
          orderedCategories
            .filter((category) => {
              const normalized =
                referenceCategoryAliases[normalizeName(category.name)] ??
                normalizeName(category.name);
              return referenceCategoryOrder.includes(normalized);
            })
            .slice(0, 12)
        );
      } catch {
        setError("No pudimos cargar las categorías.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  function handleCategoryImageError(categoryId: string) {
    setImageAttempts((current) => ({
      ...current,
      [categoryId]: (current[categoryId] ?? 0) + 1,
    }));
  }

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border-y border-white/80 bg-[#cfeaff] py-8 shadow-[inset_0_18px_45px_rgba(255,255,255,0.32)] sm:py-10">
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rotate-12 rounded-[4rem] border border-white/55" />
      <div className="pointer-events-none absolute right-32 top-8 h-40 w-40 rotate-45 border border-white/60" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full border border-white/55" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex w-full flex-col items-center text-center sm:mb-6">
          <h2 className="text-3xl font-black tracking-[-0.03em] text-[#07183c] sm:text-4xl">
            Explorar categorías
          </h2>
          <p className="mt-2 w-full max-w-2xl text-center text-sm font-medium text-slate-600 sm:text-base">
            Elegí una categoría para descubrir todos sus productos.
          </p>
        </div>

        {isLoading && <HomeCategoriesSkeleton />}

        {!isLoading && error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </p>
        )}

        {!isLoading && !error && categories.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center font-semibold text-slate-500">
            Todavía no hay categorías disponibles.
          </p>
        )}

        {!isLoading && !error && categories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto px-1 pb-3 lg:justify-between lg:gap-2">
            {categories.map((category) => {
              const imageUrls = getCategoryDisplayImageUrls(category);
              const imageAttempt = imageAttempts[category.id] ?? 0;
              const imageUrl = imageUrls[imageAttempt];
              const normalizedCategory = referenceCategoryAliases[normalizeName(category.name)] ?? normalizeName(category.name);
              const iconPosition = referenceIconPositions[normalizedCategory];
              const secondaryIconPosition = secondaryIconPositions[normalizedCategory];

              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group flex w-[82px] shrink-0 flex-col items-center text-center sm:w-[88px]"
                >
                  <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#4c1d95,#7c3aed_42%,#22d3ee_78%,#312e81)] p-[3px] transition duration-300 group-hover:-translate-y-1 sm:h-20 sm:w-20">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white">
                    {iconPosition ? (
                      <span
                        aria-hidden="true"
                        className="block h-[100px] w-[100px] shrink-0 scale-[0.66] bg-white bg-[url('/categories/category-icons-white.png')] bg-no-repeat"
                        style={{
                          backgroundPosition: `${iconPosition.left}px ${iconPosition.top}px`,
                          backgroundSize: "500px 200px",
                        }}
                      />
                    ) : secondaryIconPosition ? (
                      <span
                        aria-hidden="true"
                        className="block h-[100px] w-[100px] shrink-0 scale-[0.66] bg-white bg-[url('/categories/category-icons-secondary-white.png')] bg-no-repeat"
                        style={{
                          backgroundPosition: `${secondaryIconPosition.left}px ${secondaryIconPosition.top}px`,
                          backgroundSize: "500px 300px",
                        }}
                      />
                    ) : imageUrl ? (
                      <img
                        key={imageUrl}
                        src={imageUrl}
                        alt={category.name}
                        onError={() => handleCategoryImageError(category.id)}
                        className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-lg font-black text-[#087af2]">
                        {getCategoryInitials(category)}
                      </span>
                    )}
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <span className="line-clamp-2 block text-[11px] font-black leading-tight text-[#101828] sm:text-xs">
                      {category.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#087af2] px-4 py-2 text-sm font-black text-white shadow-[0_10px_22px_rgba(8,122,242,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0668d2]"
          >
            Ver todas las categorías
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section>
      <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-8">
        <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">
          Comprar y vender con confianza
        </h2>
        <p className="mt-2 font-semibold text-slate-500">
          Beneficios pensados para que la experiencia se sienta simple, clara y
          profesional.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-white/80 bg-white/84 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-[var(--brand-sky-border)] hover:shadow-[0_20px_55px_rgba(18,60,105,0.12)] sm:rounded-3xl sm:p-6"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-sky-soft),var(--brand-orange-soft))] text-[var(--nav-blue)]">
              <Icon className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="pb-8">
      <HeroSection />
      <HomeCategories />
      <div className="space-y-10 pt-10 sm:space-y-16 sm:pt-16 lg:space-y-20 lg:pt-20">
        <FeaturedProducts />
        <BenefitsSection />
      </div>
    </div>
  );
}

export default HomePage;
