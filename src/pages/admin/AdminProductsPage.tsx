import { useEffect, useState } from "react";
import {
  approveProduct,
  deleteProduct,
  getAdminProducts,
  rejectProduct,
} from "../../shared/services/product.service";
import type { Product, ProductApprovalStatus } from "../../shared/types/Product";

const approvalStatusLabels: Record<ProductApprovalStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

const approvalStatusClasses: Record<ProductApprovalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function getProductCategoryName(product: Product) {
  return typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "Sin categoría";
}

function getProductStatus(product: Product): ProductApprovalStatus {
  if (product.approvalStatus) return product.approvalStatus;

  return product.isActive ? "approved" : "pending";
}

function formatPrice(value: number) {
  return Number(value).toLocaleString("es-AR");
}

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProducts() {
    try {
      setError("");
      const data = await getAdminProducts();
      setProducts(data);
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmDelete = confirm("Seguro que querés eliminar este producto?");

    if (!confirmDelete) return;

    try {
      setProcessingId(id);
      setError("");
      setMessage("");
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      setMessage("Producto eliminado correctamente.");
    } catch {
      setError("No se pudo eliminar el producto.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleApprove(product: Product) {
    try {
      setProcessingId(product.id);
      setError("");
      setMessage("");
      const updatedProduct = await approveProduct(product.id);
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? updatedProduct : item))
      );
      setMessage(`"${product.title}" fue aprobado.`);
    } catch {
      setError("No se pudo aprobar el producto.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(product: Product) {
    try {
      setProcessingId(product.id);
      setError("");
      setMessage("");
      const updatedProduct = await rejectProduct(product.id);
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? updatedProduct : item))
      );
      setMessage(`"${product.title}" fue rechazado.`);
    } catch {
      setError("No se pudo rechazar el producto.");
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();
  }, []);

  if (isLoading) {
    return <p className="text-slate-500">Cargando productos...</p>;
  }

  return (
    <section className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="m-0 text-3xl font-black text-slate-950 sm:text-4xl">
          Gestión de productos
        </h1>

        <p className="mt-2 text-slate-500">
          Administrá publicaciones pendientes, aprobadas y rechazadas dentro de
          BuyMarket.
        </p>
      </div>

      {message && (
        <p className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
          {message}
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[920px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  No hay productos para administrar.
                </td>
              </tr>
            )}

            {products.map((product) => {
              const status = getProductStatus(product);
              const isProcessing = processingId === product.id;

              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {product.title}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    ${formatPrice(product.price)}
                  </td>

                  <td className="px-6 py-4 text-slate-600">{product.stock}</td>

                  <td className="px-6 py-4 text-slate-600">
                    {getProductCategoryName(product)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        approvalStatusClasses[status]
                      }`}
                    >
                      {approvalStatusLabels[status]}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => void handleApprove(product)}
                          disabled={Boolean(processingId)}
                          className="rounded-xl bg-green-50 px-4 py-2 font-bold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isProcessing ? "..." : "Aprobar"}
                        </button>
                      )}

                      {status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => void handleReject(product)}
                          disabled={Boolean(processingId)}
                          className="rounded-xl bg-yellow-50 px-4 py-2 font-bold text-yellow-700 transition hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isProcessing ? "..." : "Rechazar"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleDelete(product.id)}
                        disabled={Boolean(processingId)}
                        className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminProductsPage;
