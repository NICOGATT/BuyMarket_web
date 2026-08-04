import { useEffect, useState } from "react";
import { getPendingCategorySuggestions } from "../../shared/services/categorySuggestion.service";
import { getAdminOrders } from "../../shared/services/order.service";
import { getAdminProducts } from "../../shared/services/product.service";
import { getUsers } from "../../shared/services/user.service";

type DashboardStats = {
  products: {
    total: number;
    active: number;
    pending: number;
  };
  users: {
    total: number;
    sellers: number;
    admins: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
  };
  suggestions: {
    pending: number;
  };
};

function AdminDashboardPage() {
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      getAdminProducts(),
      getUsers(),
      getAdminOrders(),
      getPendingCategorySuggestions(),
    ])
      .then(([products, users, orders, suggestions]) => {
        if (cancelled) return;

        setDashboardStats({
          products: {
            total: products.length,
            active: products.filter(
              (product) =>
                product.isActive && product.approvalStatus === "approved"
            ).length,
            pending: products.filter(
              (product) => product.approvalStatus === "pending"
            ).length,
          },
          users: {
            total: users.length,
            sellers: users.filter((user) => user.role === "seller").length,
            admins: users.filter((user) => user.role === "admin").length,
          },
          orders: {
            total: orders.length,
            pending: orders.filter((order) => order.status === "pending").length,
            paid: orders.filter(
              (order) =>
                order.status === "paid" || order.status === "delivered"
            ).length,
          },
          suggestions: {
            pending: suggestions.length,
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudieron cargar las métricas del dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboardStats
    ? [
        {
          title: "Publicaciones",
          value: dashboardStats.products.total,
          description: `${dashboardStats.products.active} activas · ${dashboardStats.products.pending} pendientes`,
        },
        {
          title: "Usuarios",
          value: dashboardStats.users.total,
          description: `${dashboardStats.users.sellers} vendedores · ${dashboardStats.users.admins} administradores`,
        },
        {
          title: "Pedidos",
          value: dashboardStats.orders.total,
          description: `${dashboardStats.orders.pending} pendientes · ${dashboardStats.orders.paid} pagados`,
        },
        {
          title: "Sugerencias",
          value: dashboardStats.suggestions.pending,
          description: "Categorías pendientes",
        },
      ]
    : [];

  return (
    <section>
      <div className="mb-10">
        <h1 className="m-0 text-4xl font-black text-slate-950">
          Panel de administración
        </h1>

        <p className="mt-2 text-slate-500">Control general de BuyMarket.</p>
      </div>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <article
              key={index}
              className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-5 h-11 w-20 rounded bg-slate-200" />
              <div className="mt-4 h-4 w-44 rounded bg-slate-100" />
            </article>
          ))}
        </div>
      ) : dashboardStats ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                {stat.title}
              </p>

              <h2 className="m-0 mt-4 text-4xl font-black text-slate-950">
                {stat.value.toLocaleString("es-AR")}
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                {stat.description}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default AdminDashboardPage;
