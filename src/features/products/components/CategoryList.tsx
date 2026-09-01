import { ArrowRight, PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";
import type { Category } from "../../../shared/types/Category";
import {
  getCategoryIconKey,
  getCategoryIconSprite,
} from "../categoryIconSprites";
import {
  getCategoryDisplayImageUrls,
  getCategoryInitials,
} from "../../../shared/utils/categoryImages";

const categoryOrder = [
  "accesorios",
  "alimentos",
  "bebes",
  "belleza",
  "calzados",
  "computacion",
  "cotillon",
  "decobazar",
  "deportes",
  "gimnasio",
];

type CategoryListProps = {
  categories: Category[];
  isLoading: boolean;
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onShowAll: () => void;
};

function CategoryList({
  categories,
  isLoading,
  selectedCategoryId,
  onSelectCategory,
  onShowAll,
}: CategoryListProps) {
  const [imageAttempts, setImageAttempts] = useState<Record<string, number>>({});
  const orderedCategories = useMemo(
    () =>
      [...categories].sort((first, second) => {
        const firstName = getCategoryIconKey(first.name);
        const secondName = getCategoryIconKey(second.name);
        const firstIndex = categoryOrder.indexOf(firstName);
        const secondIndex = categoryOrder.indexOf(secondName);

        return (firstIndex < 0 ? 99 : firstIndex) - (secondIndex < 0 ? 99 : secondIndex);
      }),
    [categories]
  );

  function handleImageError(categoryId: string) {
    setImageAttempts((current) => ({
      ...current,
      [categoryId]: (current[categoryId] ?? 0) + 1,
    }));
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <div
            key={item}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm"
          >
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {orderedCategories.map((category) => {
          const imageUrls = getCategoryDisplayImageUrls(category);
          const imageAttempt = imageAttempts[category.id] ?? 0;
          const imageUrl = imageUrls[imageAttempt];
          const shouldShowImage = Boolean(imageUrl);
          const isActive = selectedCategoryId === category.id;
          const iconSprite = getCategoryIconSprite(category.name);

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`group flex min-h-[190px] min-w-0 flex-col items-center overflow-hidden rounded-[1.25rem] border bg-white p-3 text-center shadow-[0_10px_24px_rgba(42,101,153,0.14)] transition hover:-translate-y-1 hover:shadow-[0_17px_34px_rgba(42,101,153,0.20)] sm:min-h-[205px] ${
                isActive
                  ? "border-[var(--brand)] ring-2 ring-[var(--brand-soft)]"
                  : "border-white/80 hover:border-[var(--brand-sky-border)]"
              }`}
            >
              <span className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-white text-lg font-black text-[var(--brand)] sm:h-28">
                {iconSprite ? (
                  <span
                    aria-hidden="true"
                    className="block h-[100px] w-[100px] scale-90 bg-white bg-no-repeat sm:scale-100"
                    style={{
                      backgroundImage: `url('${iconSprite.imageUrl}')`,
                      backgroundPosition: `${iconSprite.left}px ${iconSprite.top}px`,
                      backgroundSize: iconSprite.backgroundSize,
                    }}
                  />
                ) : shouldShowImage ? (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={category.name}
                    onError={() => handleImageError(category.id)}
                    className="h-full w-full bg-white object-contain p-2 transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-white">
                    {getCategoryInitials(category)}
                  </span>
                )}
              </span>
              <span className="line-clamp-2 text-sm font-black text-[#101828] sm:text-base">
                {category.name}
              </span>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#e5f3ff] px-2.5 py-1 text-[11px] font-black text-[#0068b5] transition group-hover:gap-2.5 group-hover:bg-[#d2eaff] group-hover:text-[#004f8c] sm:text-xs">
                Ver categoría
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onShowAll}
        className="mx-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-4 font-black text-white shadow-[0_14px_30px_rgba(45,0,107,0.20)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)] sm:w-fit sm:px-8"
      >
        <PackageSearch className="h-5 w-5" />
        Ver todos los productos
      </button>
    </div>
  );
}

export default CategoryList;
