import { PackageSearch } from "lucide-react";
import { useState } from "react";
import type { Category } from "../../../shared/types/Category";
import {
  getCategoryDisplayImageUrls,
  getCategoryInitials,
} from "../../../shared/utils/categoryImages";

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
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        {categories.map((category) => {
          const imageUrls = getCategoryDisplayImageUrls(category);
          const imageAttempt = imageAttempts[category.id] ?? 0;
          const imageUrl = imageUrls[imageAttempt];
          const shouldShowImage = Boolean(imageUrl);
          const isActive = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`group flex min-w-0 flex-col items-center gap-3 overflow-hidden rounded-2xl border bg-white/86 p-4 text-center shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,60,105,0.14)] ${
                isActive
                  ? "border-[var(--brand)] ring-2 ring-[var(--brand-soft)]"
                  : "border-white/80 hover:border-[var(--brand-sky-border)]"
              }`}
            >
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white text-lg font-black text-[var(--brand)] shadow-sm sm:h-20 sm:w-20">
                {shouldShowImage ? (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={category.name}
                    onError={() => handleImageError(category.id)}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-white">
                    {getCategoryInitials(category)}
                  </span>
                )}
              </span>
              <span className="line-clamp-2 text-sm font-black text-slate-950 sm:text-base">
                {category.name}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Ver categoria
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onShowAll}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-4 font-black text-white shadow-[0_14px_30px_rgba(45,0,107,0.20)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)] sm:w-auto sm:px-8"
      >
        <PackageSearch className="h-5 w-5" />
        Ver todos los productos
      </button>
    </div>
  );
}

export default CategoryList;
