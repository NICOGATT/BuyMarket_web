import ProductCard from "./ProductCard";
import type { Product } from "../../../shared/types/Product";
import { getProductFirstImage } from "../../../shared/utils/productImages";

type ProductGridProps = {
  products: Product[];
};

function ProductGrid({products} : ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
            <ProductCard 
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                price={product.price}
                image={getProductFirstImage(product)}
            />
        ))}
    </div>
  )
}

export default ProductGrid
