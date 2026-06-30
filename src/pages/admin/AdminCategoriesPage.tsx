import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  deleteCategory,
  getCategories,
} from "../../shared/services/category.service";
import type { Category } from "../../shared/types/Category";
import {
  getCategoryBannerUrls,
  getCategoryIconUrls,
  getCategoryInitials,
} from "../../shared/utils/categoryImages";

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );
  const [bannerImageAttempts, setBannerImageAttempts] = useState<
    Record<string, number>
  >({});
  const [iconImageAttempts, setIconImageAttempts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        alert("No se pudieron cargar las categorias.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  async function handleDeleteCategory(category: Category) {
    const shouldDelete = window.confirm(
      `Seguro que queres eliminar la categoria "${category.name}"?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingCategoryId(category.id);
      await deleteCategory(category.id);
      setCategories((currentCategories) =>
        currentCategories.filter((item) => item.id !== category.id)
      );
    } catch {
      alert("No se pudo eliminar la categoria.");
    } finally {
      setDeletingCategoryId(null);
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Cargando categorias...</p>;
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Categorias
        </h1>

        <p className="mt-2 text-slate-500">
          Listado de categorias disponibles para publicaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const bannerUrls = getCategoryBannerUrls(category);
          const iconUrls = getCategoryIconUrls(category);
          const bannerUrl = bannerUrls[bannerImageAttempts[category.id] ?? 0];
          const iconUrl = iconUrls[iconImageAttempts[category.id] ?? 0];
          const shouldShowBanner = Boolean(bannerUrl);
          const shouldShowIcon = Boolean(iconUrl);

          return (
            <article
              key={category.id}
              className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => handleDeleteCategory(category)}
                disabled={deletingCategoryId === category.id}
                aria-label={`Eliminar categoria ${category.name}`}
                className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:right-4 sm:top-4"
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>

              {shouldShowBanner ? (
                <img
                  key={bannerUrl}
                  src={bannerUrl}
                  alt={category.name}
                  onError={() =>
                    setBannerImageAttempts((current) => ({
                      ...current,
                      [category.id]: (current[category.id] ?? 0) + 1,
                    }))
                  }
                  className="h-32 w-full object-cover sm:h-36"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-slate-100 text-sm font-bold text-slate-400 sm:h-36">
                  Sin banner
                </div>
              )}

              <div className="p-4 sm:p-6">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  {shouldShowIcon ? (
                    <img
                      key={iconUrl}
                      src={iconUrl}
                      alt={category.name}
                      onError={() =>
                        setIconImageAttempts((current) => ({
                          ...current,
                          [category.id]: (current[category.id] ?? 0) + 1,
                        }))
                      }
                      className="h-12 w-12 shrink-0 rounded-2xl object-cover sm:h-14 sm:w-14"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)] sm:h-14 sm:w-14">
                      {getCategoryInitials(category)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="m-0 truncate text-lg font-black text-slate-950 sm:text-xl">
                      {category.name}
                    </h2>

                    <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                      {category.description || "Sin descripcion"}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AdminCategoriesPage;
