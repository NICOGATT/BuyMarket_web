import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "rounded-xl bg-white px-4 py-3 font-bold text-[var(--nav-blue)] shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
    : "rounded-xl px-4 py-3 font-bold text-white/78 transition hover:bg-white/10 hover:text-white";

function AdminLayout() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-left">
      <aside className="border-b border-white/10 bg-[linear-gradient(180deg,var(--nav-blue),#082744)] p-4 text-white shadow-[0_24px_80px_rgba(18,60,105,0.26)] lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6">
        <h1 className="m-0 text-2xl font-black text-white">BuyAdmin</h1>
        <p className="mt-2 text-sm font-semibold text-white/60">
          Operacion y control
        </p>

        <nav className="mt-5 flex flex-col gap-2 lg:mt-10">
          <NavLink className={adminLinkClass} to="/admin" end>
            Dashboard
          </NavLink>

          <NavLink className={adminLinkClass} to="/admin/products">
            Productos
          </NavLink>

          <div>
            <button
              onClick={() => setIsCategoriesOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-bold text-white/78 transition hover:bg-white/10 hover:text-white"
            >
              <span>Categorias</span>
              <ChevronDown
                size={18}
                className={`transition ${isCategoriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCategoriesOpen && (
              <div className="ml-4 mt-2 flex flex-col gap-1 border-l border-white/20 pl-3">
                <NavLink className={adminLinkClass} to="/admin/categories" end>
                  Ver categorias
                </NavLink>

                <NavLink
                  className={adminLinkClass}
                  to="/admin/categories/create"
                >
                  Agregar categoria
                </NavLink>

                <NavLink
                  className={adminLinkClass}
                  to="/admin/subcategories-attributes"
                >
                  Subcategorias y atributos
                </NavLink>
              </div>
            )}
          </div>

          <NavLink className={adminLinkClass} to="/admin/category-suggestions">
            Sugerencias
          </NavLink>

          <NavLink className={adminLinkClass} to="/admin/users">
            Usuarios
          </NavLink>

          <NavLink className={adminLinkClass} to="/admin/orders">
            Pedidos
          </NavLink>

          <NavLink className={adminLinkClass} to="/admin/shipments">
            Envios
          </NavLink>

          <NavLink className={adminLinkClass} to="/admin/withdrawals">
            Retiros
          </NavLink>

          <NavLink className={adminLinkClass} to="/admin/plans">
            Planes
          </NavLink>
        </nav>
      </aside>

      <main className="min-h-screen p-4 sm:p-6 lg:ml-72 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
