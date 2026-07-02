import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProductCardSkeleton from "../features/products/components/ProductCardSkeleton";
import ProductGrid from "../features/products/components/ProductGrid";
import EmptyProducts from "../shared/components/EmptyProducts";
import { getCategories } from "../shared/services/category.service";
import { getProducts } from "../shared/services/product.service";
import { getSubCategoriesByCategory } from "../shared/services/subcategory.service";
import type { Category } from "../shared/types/Category";
import type { Product } from "../shared/types/Product";
import type { SubCategory } from "../shared/types/SubCategory";
import {
  getCategoryDisplayImageUrls,
  getCategoryInitials,
} from "../shared/utils/categoryImages";
import { getProductCategoryId } from "../shared/utils/productCategories";

function getProductSubCategoryId(product: Product) {
  return (
    product.subCategory?.id ??
    product.subCategoryId ??
    product.subcategory?.id ??
    product.subcategoryId ??
    ""
  );
}

function getEmptyMessage(hasSearch: boolean, hasCategory: boolean, hasSubCategory: boolean) {
  if (hasSubCategory) return "No hay productos para esta subcategoria.";
  if (hasCategory) return "No hay productos para esta categoria.";
  if (hasSearch) return "No encontramos productos con esa busqueda.";
  return "Todavia no hay productos publicados.";
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [error, setError] = useState("");
  const [categoryImageAttempts, setCategoryImageAttempts] = useState<
    Record<string, number>
  >({});
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search")?.trim() ?? "";
  const normalizedSearch = search.toLowerCase();
  const selectedCategoryId = searchParams.get("category") ?? "";
  const selectedSubCategoryId = searchParams.get("subCategory") ?? "";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = normalizedSearch
        ? `${product.title} ${product.description}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesCategory = selectedCategoryId
        ? getProductCategoryId(product) === selectedCategoryId
        : true;
      const productSubCategoryId = getProductSubCategoryId(product);
      const matchesSubCategory =
        selectedSubCategoryId && productSubCategoryId
          ? productSubCategoryId === selectedSubCategoryId
          : true;

      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [normalizedSearch, products, selectedCategoryId, selectedSubCategoryId]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch {
        setError("No se pudieron cargar los productos.");
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;

    async function loadSubCategories() {
      setIsLoadingSubCategories(true);

      try {
        const data = await getSubCategoriesByCategory(selectedCategoryId);
        setSubCategories(data);
      } catch {
        setSubCategories([]);
      } finally {
        setIsLoadingSubCategories(false);
      }
    }

    loadSubCategories();
  }, [selectedCategoryId]);

  function updateFilters(nextFilters: {
    category?: string;
    subCategory?: string;
  }) {
    const nextParams = new URLSearchParams(searchParams);

    if (nextFilters.category !== undefined) {
      if (nextFilters.category) {
        nextParams.set("category", nextFilters.category);
      } else {
        nextParams.delete("category");
        setSubCategories([]);
      }
      nextParams.delete("subCategory");
    }

    if (nextFilters.subCategory !== undefined) {
      if (nextFilters.subCategory) {
        nextParams.set("subCategory", nextFilters.subCategory);
      } else {
        nextParams.delete("subCategory");
      }
    }

    setSearchParams(nextParams);
  }

  function handleCategoryImageError(categoryId: string) {
    setCategoryImageAttempts((current) => ({
      ...current,
      [categoryId]: (current[categoryId] ?? 0) + 1,
    }));
  }

  return (
    <section>
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Explorar productos
        </h1>
        <p className="mt-2 text-slate-500">
          {search
            ? `Resultados para "${search}"`
            : "Elegí una categoría o navegá todos los productos activos."}
        </p>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="m-0 text-xl font-black text-slate-950">
                Categorias
              </h2>
              {selectedCategoryId && (
                <button
                  type="button"
                  onClick={() => updateFilters({ category: "" })}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Todas
                </button>
              )}
            </div>

            <div className="space-y-2 overflow-y-auto pr-1 lg:max-h-[55vh]">
              <button
                type="button"
                onClick={() => updateFilters({ category: "" })}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left font-bold transition ${
                  !selectedCategoryId
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-hover)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand-border)]"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black">
                  All
                </span>
                Todas
              </button>

              {categories.map((category) => {
                const imageUrls = getCategoryDisplayImageUrls(category);
                const imageAttempt = categoryImageAttempts[category.id] ?? 0;
                const imageUrl = imageUrls[imageAttempt];
                const shouldShowImage = Boolean(imageUrl);
                const isActive = selectedCategoryId === category.id;

                return (
                  <div key={category.id} className="overflow-hidden rounded-2xl">
                    <button
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: isActive ? "" : category.id,
                        })
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-hover)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand-border)]"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-sm font-black text-slate-500">
                        {shouldShowImage ? (
                          <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={category.name}
                            onError={() => handleCategoryImageError(category.id)}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getCategoryInitials(category)
                        )}
                      </span>
                      <span className="line-clamp-2 flex-1 font-bold">
                        {category.name}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition ${
                          isActive ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isActive
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-5 mt-2 max-h-72 space-y-2 overflow-y-auto border-l border-slate-200 pl-3 pr-1">
                        {isLoadingSubCategories ? (
                          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
                            Cargando...
                          </p>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => updateFilters({ subCategory: "" })}
                              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                                !selectedSubCategoryId
                                  ? "bg-[var(--brand)] text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }`}
                            >
                              Todas
                            </button>

                            {subCategories.map((subCategory) => (
                              <button
                                key={subCategory.id}
                                type="button"
                                onClick={() =>
                                  updateFilters({
                                    subCategory: subCategory.id,
                                  })
                                }
                                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                                  selectedSubCategoryId === subCategory.id
                                    ? "bg-[var(--brand)] text-white"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                              >
                                {subCategory.name}
                              </button>
                            ))}

                            {subCategories.length === 0 && (
                              <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
                                Sin subcategorias.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <ProductCardSkeleton key={item} />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <p className="font-semibold text-red-500">{error}</p>
          )}

          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <EmptyProducts />
              <p className="mt-4 font-semibold text-slate-500">
                {getEmptyMessage(
                  Boolean(search),
                  Boolean(selectedCategoryId),
                  Boolean(selectedSubCategoryId)
                )}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredProducts.length > 0 && (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductsPage;

