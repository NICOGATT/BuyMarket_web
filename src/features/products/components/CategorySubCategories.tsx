import {
  getCuratedSubCategories,
  normalizeName,
} from "../categoryConfig";

type CategorySubCategoriesProps = {
  categoryName: string;
  selectedSubCategoryName: string;
  onSelect: (subCategoryName: string) => void;
};

function CategorySubCategories({
  categoryName,
  selectedSubCategoryName,
  onSelect,
}: CategorySubCategoriesProps) {
  const subCategories = getCuratedSubCategories(categoryName);

  if (subCategories.length === 0) return null;

  return (
    <section
      aria-label="Subcategorias"
      className="rounded-[28px] border border-white/50 bg-[var(--category-panel,rgba(255,255,255,0.52))] px-4 py-5 shadow-[0_16px_42px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:px-6"
    >
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5">
        {subCategories.map((subCategory) => {
          const normalizedName = normalizeName(subCategory.name);
          const Icon = subCategory.icon;
          const isActive = selectedSubCategoryName === normalizedName;

          return (
            <button
              key={normalizedName}
              type="button"
              onClick={() => onSelect(isActive ? "" : normalizedName)}
              className="group flex w-24 shrink-0 flex-col items-center gap-2 sm:w-28"
              title={subCategory.name}
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-[0_10px_28px_rgba(18,60,105,0.10)] transition group-hover:-translate-y-1 sm:h-20 sm:w-20 ${
                  isActive
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "border-slate-100 text-slate-500 group-hover:border-[var(--brand-border)] group-hover:text-[var(--brand)]"
                }`}
              >
                <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
              </span>
              <span
                className={`line-clamp-2 text-center text-xs font-bold leading-4 sm:text-sm ${
                  isActive
                    ? "text-[var(--brand-hover)]"
                    : "text-[var(--category-muted,#475569)]"
                }`}
              >
                {subCategory.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CategorySubCategories;
