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
      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
      : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={gridClassName}>
        {products.map((product) => (
            <ProductCard 
                key={product.id}
                product={product}
                badge={badge}
            />
        ))}
    </div>
  )
}

export default ProductGrid
