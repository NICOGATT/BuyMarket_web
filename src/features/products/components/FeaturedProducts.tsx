import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageSearch, Sparkles } from "lucide-react";
import type { Product } from "../../../shared/types/Product";
import { getFeaturedProducts } from "../../../shared/services/product.service";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductGrid from "./ProductGrid";

function FeaturedProductsHeader() {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-sky-soft)] px-3 py-1 text-sm font-black text-[var(--nav-blue)]">
          <Sparkles className="h-4 w-4" />
          Selección BuyMarket
        </span>
        <h2 className="mt-3 text-3xl font-black text-slate-950">
          Productos destacados
        </h2>
        <p className="mt-2 max-w-2xl font-semibold text-slate-500">
          Publicaciones con más actividad y productos promocionados.
        </p>
      </div>
      <Link
        to="/products"
        className="font-black text-[var(--brand)] transition hover:text-[var(--brand-hover)]"
      >
        Ver todos
      </Link>
    </div>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getFeaturedProducts();
        setProducts(data.slice(0, 4));
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar los productos destacados");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <section>
        <FeaturedProductsHeader />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <ProductCardSkeleton key={item} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <FeaturedProductsHeader />
        <p className="rounded-3xl border border-red-200 bg-red-50 p-6 font-semibold text-red-700 shadow-sm">
          {error}
        </p>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section>
        <FeaturedProductsHeader />
        <div className="overflow-hidden rounded-[32px] border border-dashed border-[var(--brand-border)] bg-white/84 shadow-[0_18px_50px_rgba(18,60,105,0.08)] backdrop-blur">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,var(--brand-sky-soft),var(--brand-orange-soft),var(--brand-soft))] text-[var(--brand)]">
              <PackageSearch className="h-9 w-9" />
            </span>
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                Todavía no hay productos destacados
              </h3>
              <p className="mt-2 max-w-2xl font-semibold text-slate-500">
                Cuando haya publicaciones activas desde la API, BuyMarket las va a mostrar acá automáticamente.
              </p>
            </div>
            <Link
              to="/products/create"
              className="inline-flex justify-center rounded-2xl bg-[var(--brand)] px-5 py-3 font-black text-white shadow-[0_14px_30px_rgba(45,0,107,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-hover)]"
            >
              Publicar producto
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <FeaturedProductsHeader />
      <ProductGrid products={products} variant="compact" />
    </section>
  );
}

export default FeaturedProducts;
