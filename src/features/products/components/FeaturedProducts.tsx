import type {Product } from "../../../shared/types/Product";
import { getFeaturedProducts } from "../../../shared/services/product.service";
import { useState, useEffect } from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";
import ProductGrid from "./ProductGrid";
function FeaturedProducts() {
    const [products, setProducts] = useState<Product[]>([]); 
    const [isLoadig, setIsLoading] = useState(true); 
    const [error, setError] = useState<string | null>(null); 

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getFeaturedProducts(); 
                setProducts(data.slice(0, 4))
            } catch (error) {
                console.error(error); 
                setError("No se pudieron cargar los productos destacados")
            } finally{
                setIsLoading(false)
            }
        }
        loadProducts()
    }, []);

    if(isLoadig) {
        return (
            <section>
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-950">
                        Productos destacados
                    </h2>
                    <p className="mt-2 max-w-2xl font-semibold text-slate-500">
                        Publicaciones con más actividad y productos promocionados.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {[1,2,3,4].map((item) => (
                    <ProductCardSkeleton key={item}/>
                ))}
                </div>
            </section>
        )
    }

    if(error) {
        return (
            <section>
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-950">
                        Productos destacados
                    </h2>
                    <p className="mt-2 max-w-2xl font-semibold text-slate-500">
                        Publicaciones con más actividad y productos promocionados.
                    </p>
                </div>
                <p className="rounded-2xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
                    {error}
                </p>
            </section>
        )
    }

    if(products.length === 0) {
        return (
            <section>
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-950">
                        Productos destacados
                    </h2>
                    <p className="mt-2 max-w-2xl font-semibold text-slate-500">
                        Publicaciones con más actividad y productos promocionados.
                    </p>
                </div>
                <p className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-slate-500 shadow-sm">
                    Todavía no hay productos destacados.
                </p>
            </section>
        )
    }
    return (
        <section>
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-950">
                        Productos destacados
                    </h2>
                    <p className="mt-2 max-w-2xl font-semibold text-slate-500">
                        Publicaciones con más actividad y productos promocionados.
                    </p>
                </div>
                <a href="/products" className="font-bold text-blue-600 hover:text-blue-700">
                    Ver todos
                </a>
            </div>
            <ProductGrid products={products} variant="compact" />

        </section>
    );
}

export default FeaturedProducts;
