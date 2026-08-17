import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BadgePercent, PackageSearch, Sparkles } from "lucide-react";
import type { Product } from "../../../shared/types/Product";
import { getProducts } from "../../../shared/services/product.service";
import {
  hasProductOffer,
  productMatchesBrand,
} from "../../../shared/utils/productMarketing";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductGrid from "./ProductGrid";

const FEATURED_BRANDS = ["RPM"];

type ProductSectionProps = {
  badge: "Destacado" | "Oferta";
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconClassName: string;
  products: Product[];
  isLoading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyDescription: string;
};

function ProductSection({
  badge,
  eyebrow,
  title,
  description,
  icon,
  iconClassName,
  products,
  isLoading,
  error,
  emptyTitle,
  emptyDescription,
}: ProductSectionProps) {
  return (
    <section>
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex flex-col items-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-black ${iconClassName}`}
          >
            {icon}
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-950">{title}</h2>
          <p className="mx-auto mt-2 max-w-2xl font-semibold text-slate-500">
            {description}
          </p>
        </div>
        <Link
          to="/products"
          className="mt-1 font-black text-[var(--brand)] transition hover:text-[var(--brand-hover)]"
        >
          Ver todos
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <ProductCardSkeleton key={item} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="rounded-3xl border border-red-200 bg-red-50 p-6 font-semibold text-red-700 shadow-sm">
          {error}
        </p>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="overflow-hidden rounded-[32px] border border-dashed border-[var(--brand-border)] bg-white/84 shadow-[0_18px_50px_rgba(18,60,105,0.08)] backdrop-blur">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,var(--brand-sky-soft),var(--brand-orange-soft),var(--brand-soft))] text-[var(--brand)]">
              <PackageSearch className="h-9 w-9" />
            </span>
            <div>
              <h3 className="text-2xl font-black text-slate-950">
                {emptyTitle}
              </h3>
              <p className="mt-2 max-w-2xl font-semibold text-slate-500">
                {emptyDescription}
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
      )}

      {!isLoading && !error && products.length > 0 && (
        <ProductGrid products={products} variant="compact" badge={badge} />
      )}
    </section>
  );
}

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (loadError) {
        console.error(loadError);
        setError("No se pudieron cargar los productos");
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const featuredProducts = products.filter((product) =>
    FEATURED_BRANDS.some((brand) => productMatchesBrand(product, brand))
  );
  const offerProducts = products.filter(hasProductOffer);

  return (
    <div className="space-y-10 sm:space-y-16 lg:space-y-20">
      <ProductSection
        badge="Destacado"
        eyebrow="Selección BuyMarket"
        title="Productos destacados"
        description="Una selección especial de productos y marcas destacadas."
        icon={<Sparkles className="h-4 w-4" />}
        iconClassName="bg-[var(--brand-sky-soft)] text-[var(--nav-blue)]"
        products={featuredProducts}
        isLoading={isLoading}
        error={error}
        emptyTitle="Todavía no hay productos destacados"
        emptyDescription="Cuando haya productos de las marcas seleccionadas, BuyMarket los va a mostrar acá automáticamente."
      />

      <ProductSection
        badge="Oferta"
        eyebrow="Precios y beneficios especiales"
        title="Ofertas"
        description="Productos con descuento o con promociones disponibles mediante cupones."
        icon={<BadgePercent className="h-4 w-4" />}
        iconClassName="bg-[var(--brand-orange-soft)] text-[var(--brand-hover)]"
        products={offerProducts}
        isLoading={isLoading}
        error={error}
        emptyTitle="Todavía no hay ofertas disponibles"
        emptyDescription="Los productos con descuento o promociones por cupón van a aparecer acá automáticamente."
      />
    </div>
  );
}

export default FeaturedProducts;
