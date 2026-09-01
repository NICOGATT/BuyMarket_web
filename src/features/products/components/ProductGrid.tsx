import ProductCard from "./ProductCard";
import type { Product } from "../../../shared/types/Product";

type ProductGridProps = {
  products: Product[];
  variant?: "default" | "compact";
  badge?: "Destacado" | "Oferta";
};

function ProductGrid({
  products,
  variant = "default",
  badge = "Destacado",
}: ProductGridProps) {
  const gridClassName =
    variant === "compact"
      ? "flex flex-wrap justify-start gap-3 sm:gap-4"
      : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={gridClassName}>
        {products.map((product) => (
          <div
            key={product.id}
            className={variant === "compact" ? "w-[158px] sm:w-[176px] lg:w-[188px]" : "contents"}
          >
            <ProductCard
                key={product.id}
                product={product}
                badge={badge}
                compact={variant === "compact"}
            />
          </div>
        ))}
    </div>
  )
}

export default ProductGrid
