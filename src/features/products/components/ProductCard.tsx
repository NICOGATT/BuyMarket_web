import type { Product, ProductCardProps } from "../../../shared/types/Product";
import { Link, useNavigate } from "react-router-dom";
import { addCart, isAuthRequiredError } from "../../cart/store/cartStore";
import { useState } from "react";
import type { Category } from "../../../shared/types/Category";
function ProductCard({ id,title, description, price, image }: ProductCardProps) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const navigate = useNavigate();

    async function handleAddToCart() {
        const product : Product = {
            id: id,
            title,
            description,
            price,
            images: image ? [image] : [],
            stock: 0,
            category: "" as unknown as Category,
            isActive: true,
            owner: "",
        };

        try {
            setIsAddingToCart(true);
            await addCart(product);
            alert("Producto agregado al carrito");
        } catch (error) {
            if (isAuthRequiredError(error)) {
                alert("Inicia sesion para agregar productos al carrito.");
                navigate("/login");
                return;
            }

            alert("No se pudo agregar el producto al carrito.");
        } finally {
            setIsAddingToCart(false);
        }
    }
    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md w-55">
        <div className="relative aspect-[4/3] overflow-hidden border-b border-slate-100 bg-slate-50">
            {image ? (
                <img
                src={image}
                alt={title}
                className="h-full w-full object-contain p-3"
                loading="lazy"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                    Sin imagen
                </div>
            )}
        </div>

            <div className="flex min-h-56 flex-1 flex-col p-5">
                <h3 className="line-clamp-2 text-xl font-black text-slate-950">
                    {title}
                </h3>

                <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                    {description}
                </p>

                <div className="mt-auto pt-3">
                    <span className="text-2xl font-black text-blue-600">
                    ${price.toLocaleString("es-AR")}
                    </span>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Link
                            to={`/products/${id}`}
                            className="flex justify-center items-center rounded-xl bg-slate-950 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                            Ver
                        </Link>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                            {isAddingToCart ? "Agregando..." : "Comprar"}
                        </button>
                    </div>
                </div>

            </div>
        </article>
    );
}

export default ProductCard;
