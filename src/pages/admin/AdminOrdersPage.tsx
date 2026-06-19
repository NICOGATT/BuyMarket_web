import { useEffect, useState } from "react";
import { getAdminOrders } from "../../shared/services/order.service";
import type { Order } from "../../shared/types/Order";

function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadOrders() {
        try {
            const data = await getAdminOrders();
            setOrders(data);
        } catch {
            alert("No se pudieron cargar las órdenes.");
        } finally {
            setIsLoading(false);
        }
        }

        loadOrders();
    }, []);

    if (isLoading) {
        return <p className="text-slate-500">Cargando órdenes...</p>;
    }

    return (
        <section>
        <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-950">Órdenes</h1>

            <p className="mt-2 text-slate-500">
            Revisá pedidos, estados e incidencias dentro de BuyMarket.
            </p>
        </div>

        {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-2xl font-black text-slate-900">
                No hay órdenes todavía
            </h2>

            <p className="mt-2 text-slate-500">
                Cuando los usuarios realicen compras, aparecerán acá.
            </p>
            </div>
        ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                    <th className="px-6 py-4">Orden</th>
                    <th className="px-6 py-4">Comprador</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Fecha</th>
                </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                    <tr key={order.id}>
                    <td className="px-6 py-4 font-bold text-slate-900">
                        #{order.id.slice(0, 8)}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                        {order.buyer?.email ?? "Sin comprador"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                        {order.items?.length ?? 0}
                    </td>

                    <td className="px-6 py-4 font-bold text-blue-600">
                        ${order.total.toLocaleString("es-AR")}
                    </td>

                    <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        {order.status}
                        </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                        {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("es-AR")
                        : "-"}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </section>
  );
}

export default AdminOrdersPage;
