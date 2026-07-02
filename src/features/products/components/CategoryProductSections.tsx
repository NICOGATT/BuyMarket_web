import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Layers3 } from "lucide-react";
import ProductGrid from "./ProductGrid";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { getCategories } from "../../../shared/services/category.service";
import { getProducts } from "../../../shared/services/product.service";
import type { Category } from "../../../shared/types/Category";
import type { Product } from "../../../shared/types/Product";
import { getProductCategoryId } from "../../../shared/utils/productCategories";

type CategorySection = {
  category: Category;
  products: Product[];
};

function CategoryProductSections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategorySections() {
      try {
        const [categoriesData, productsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        setCategories(categoriesData);
        setProducts(productsData);
      } catch {
        setError("No se pudieron cargar las categorías.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategorySections();
  }, []);

  const categorySections = useMemo<CategorySection[]>(() => {
    return categories
      .map((category) => {
        const categoryProducts = products
          .filter((product) => getProductCategoryId(product) === category.id)
          .slice(0, 4);

        return {
          category,
          products: categoryProducts,
        };
      })
      .filter((section) => section.products.length > 0);
  }, [categories, products]);

  if (isLoading) {
    return (
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-950">Categorías</h2>
          <p className="mt-2 max-w-2xl font-semibold text-slate-500">
            Explorá productos agrupados por rubro.
          </p>
        </div>
        <div className="space-y-12">
          {[1, 2].map((section) => (
            <div key={section}>
              <div className="mb-5 h-8 w-52 rounded-xl bg-slate-100" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <ProductCardSkeleton key={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-950">Categorías</h2>
          <p className="mt-2 max-w-2xl font-semibold text-slate-500">
            Explorá productos agrupados por rubro.
          </p>
        </div>
        <p className="rounded-3xl border border-red-200 bg-red-50 p-6 font-semibold text-red-700">
          {error}
        </p>
      </section>
    );
  }

  if (categorySections.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--nav-blue-soft)] px-3 py-1 text-sm font-black text-[var(--nav-blue)]">
          <Layers3 className="h-4 w-4" />
          Catálogo activo
        </span>
        <h2 className="mt-3 text-3xl font-black text-slate-950">
          Más categorías para descubrir
        </h2>
        <p className="mt-2 max-w-2xl font-semibold text-slate-500">
          Explorá productos agrupados por rubro.
        </p>
      </div>

      <div className="space-y-14">
        {categorySections.map(({ category, products: categoryProducts }) => (
          <section
            key={category.id}
            aria-labelledby={`category-${category.id}`}
            className="rounded-[32px] border border-slate-100 bg-white/74 p-5 shadow-[0_18px_55px_rgba(18,60,105,0.08)] backdrop-blur sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3
                  id={`category-${category.id}`}
                  className="m-0 text-2xl font-black text-slate-950"
                >
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-1 max-w-xl font-semibold text-slate-500">
                    {category.description}
                  </p>
                )}
              </div>

              <Link
                to={`/products?category=${category.id}`}
                className="font-black text-[var(--brand)] transition hover:text-[var(--brand-hover)]"
              >
                Ver categoría
              </Link>
            </div>

            <ProductGrid products={categoryProducts} variant="compact" />
          </section>
        ))}
      </div>
    </section>
  );
}

export default CategoryProductSections;
