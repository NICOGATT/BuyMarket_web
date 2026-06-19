import type {Product } from "../../../shared/types/Product";
import { getProducts } from "../../../shared/services/product.service";
import { useState, useEffect } from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";
import EmptyProducts from "../../../shared/components/EmptyProducts";
import ProductGrid from "./ProductGrid";
function FeaturedProducts() {
    const [products, setProducts] = useState<Product[]>([]); 
    const [isLoadig, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null); 

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getProducts(); 
                setProducts(data)
            } catch (error) {
                console.error(error); 
                setError("No se pudieron cargar los productos")
            } finally{
                setIsLoading(false)
            }
        }
        loadProducts()
    }, []);

    if(isLoadig) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1,2,3].map((item) => (
                    <ProductCardSkeleton key={item}/>
                ))}
            </div>
        )
    }

    if(error) {
        return <p className="font-semibold text-red-500">{error}</p>
    }

    if(products.length === 0) {
        return <EmptyProducts/>
    }
    return (
        <section>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-950">
                        Productos destacados
                    </h2>

                    <p className="mt-2 text-slate-500">
                        Publicaciones activas dentro de Buy Market
                    </p>
                </div>
                <button className="font-bold text-blue-600 hover:text-blue-700">
                    Ver todos
                </button>
            </div>
            <ProductGrid products={products} />

        </section>
    );
}

export default FeaturedProducts;
