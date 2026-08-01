import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category } from "../../../shared/types/Category";
import { getCategoryBannerUrl } from "../../../shared/utils/categoryImages";
import { getCategoryConfig } from "../categoryConfig";

type CategoryHeroProps = {
  category: Category;
};

function CategoryHero({ category }: CategoryHeroProps) {
  const config = getCategoryConfig(category.name);
  const description = category.description?.trim() || config.description || "";
  const bannerUrl = getCategoryBannerUrl(category);
  const brandCards = config.brands;

  return (
    <section
      className={`relative isolate overflow-hidden rounded-2xl bg-gradient-to-br ${config.accent} px-4 py-7 text-white shadow-[0_34px_100px_rgba(18,60,105,0.24)] sm:rounded-[32px] sm:px-8 sm:py-9 lg:px-12 lg:py-12`}
    >
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(255,255,255,0.28),transparent_32%)]" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          <Sparkles className="h-4 w-4 shrink-0" />
          Categoria
        </span>

        <h1
          className="mt-4 text-4xl font-black leading-[0.95] tracking-wide text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.18)] sm:text-6xl lg:text-7xl"
          style={{ fontFamily: config.font }}
        >
          {category.name}
        </h1>

        {description && (
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/90 sm:text-lg sm:leading-8">
            {description}
          </p>
        )}

        {brandCards.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-widest text-white/70">
              Marcas destacadas
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              {brandCards.map((brand, index) => (
                <Link
                  key={`${brand.name}-${index}`}
                  to={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="group w-36 shrink-0 rounded-2xl border border-white/20 bg-white/92 p-3 text-[var(--text-main)] shadow-[0_16px_38px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:bg-white sm:w-44"
                >
                  <span
                    className={`mb-2 flex h-20 w-full items-center justify-center rounded-xl bg-gradient-to-br ${brand.accent} text-2xl font-black text-white shadow-sm sm:h-24`}
                  >
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="block truncate text-base font-black">
                    {brand.name}
                  </span>
                  <span className="mt-2 inline-flex rounded-lg bg-[var(--brand-orange)] px-3 py-1 text-xs font-black text-white transition group-hover:bg-[var(--brand-orange-hover)]">
                    Ver ofertas
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryHero;
