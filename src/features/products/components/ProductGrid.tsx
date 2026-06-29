import ProductCard from "./ProductCard";
import type { Product } from "../../../shared/types/Product";
import { getProductFirstImage } from "../../../shared/utils/productImages";
import { getProductCategoryName } from "../../../shared/utils/productCategories";

type ProductGridProps = {
  products: Product[];
  variant?: "default" | "compact";
};

function ProductGrid({products, variant = "default"} : ProductGridProps) {
  const gridClassName =
    variant === "compact"
      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
      : "grid grid-cols-1 gap-20 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={gridClassName}>
        {products.map((product) => (
            <ProductCard 
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                price={product.price}
                image={getProductFirstImage(product)}
                categoryName={getProductCategoryName(product)}
            />
        ))}
    </div>
  )
}

export default ProductGrid
