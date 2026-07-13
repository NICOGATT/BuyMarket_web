import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import HeroSection from "../features/home/components/HeroSection";
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

function HomeCategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-white/80 bg-white/76 p-3 shadow-sm sm:rounded-3xl"
        >
          <div className="mx-auto h-20 w-20 rounded-2xl bg-slate-100 sm:h-24 sm:w-24" />
          <div className="mx-auto mt-4 h-4 w-3/4 rounded-full bg-slate-100" />
          <div className="mx-auto mt-2 h-3 w-1/2 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageAttempts, setImageAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data.slice(0, 6));
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
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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

function BenefitsSection() {
  return (
    <section>
      <div className="mb-6 max-w-2xl sm:mb-8">
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
    <div className="space-y-10 pb-8 sm:space-y-16 lg:space-y-20">
      <HeroSection />
      <HomeCategories />
      <FeaturedProducts />
      <BenefitsSection />
    </div>
  );
}

export default HomePage;
