import { useEffect, useState } from "react";
import {
  deleteProduct,
  getProducts,
} from "../../shared/services/product.service";
import type { Product } from "../../shared/types/Product";

function getProductCategoryName(product: Product) {
  return typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "Sin categoria";
}

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadProducts() {
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Seguro que queres eliminar este producto?");

    if (!confirmDelete) return;

    await deleteProduct(id);

    setProducts((prev) => prev.filter((product) => product.id !== id));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  if (isLoading) {
    return <p className="text-slate-500">Cargando productos...</p>;
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Gestion de productos
        </h1>

        <p className="mt-2 text-slate-500">
          Administra publicaciones activas dentro de BuyMarket.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[760px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 font-bold text-slate-900">
                  {product.title}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  ${product.price.toLocaleString("es-AR")}
                </td>

                <td className="px-6 py-4 text-slate-600">{product.stock}</td>

                <td className="px-6 py-4 text-slate-600">
                  {getProductCategoryName(product)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {product.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminProductsPage;
