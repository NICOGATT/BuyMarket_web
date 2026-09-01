import { ArrowUpRight } from "lucide-react";
import { normalizeName } from "../categoryConfig";

type CategorySubCategoryFooterProps = {
  categoryName: string;
  subCategories: Array<{ id?: string; name: string }>;
  selectedSubCategoryName: string;
  onSelect: (subCategoryName: string) => void;
};

function CategorySubCategoryFooter({
  categoryName,
  subCategories,
  selectedSubCategoryName,
  onSelect,
}: CategorySubCategoryFooterProps) {
  if (subCategories.length === 0) return null;

  return (
    <footer
      aria-labelledby="category-subcategories-footer-title"
      className="border-t border-current/10 pt-8 sm:pt-10"
    >
      <div className="rounded-[28px] border border-white/50 bg-[var(--category-panel,rgba(255,255,255,0.72))] px-5 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:px-8 sm:py-8"
      >
        <div className="max-w-2xl">
          <h2
            id="category-subcategories-footer-title"
            className="m-0 text-2xl font-black text-[var(--category-title,#0f172a)] sm:text-3xl"
          >
            {categoryName}
          </h2>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10">
          {subCategories.map((subCategory) => {
            const normalizedName = normalizeName(subCategory.name);
            const isActive = selectedSubCategoryName === normalizedName;

            return (
              <li key={subCategory.id ?? normalizedName}>
                <button
                  type="button"
                  onClick={() => onSelect(normalizedName)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex w-full items-center justify-between gap-2 border-b border-current/10 py-3 text-left text-sm transition sm:text-base ${
                    isActive
                      ? "font-black text-[var(--category-title,#0f172a)]"
                      : "font-semibold text-[var(--category-muted,#64748b)] hover:text-[var(--category-title,#0f172a)]"
                  }`}
                >
                  <span>{subCategory.name}</span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 opacity-45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </footer>
  );
}

export default CategorySubCategoryFooter;
