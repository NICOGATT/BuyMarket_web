import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "rounded-xl bg-blue-600 px-4 py-3 font-bold text-white"
    : "rounded-xl px-4 py-3 font-bold text-slate-600 hover:bg-slate-100";

function AdminLayout() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-left">
      <aside className="border-b border-slate-200 bg-white p-4 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
        <h1 className="m-0 text-2xl font-black text-blue-600">BuyAdmin</h1>

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
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-bold text-slate-600 hover:bg-slate-100"
            >
              <span>Categorias</span>
              <ChevronDown
                size={18}
                className={`transition ${isCategoriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCategoriesOpen && (
              <div className="ml-4 mt-2 flex flex-col gap-1 border-l border-slate-200 pl-3">
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
