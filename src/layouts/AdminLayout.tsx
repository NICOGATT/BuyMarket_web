import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "shrink-0 rounded-xl bg-white px-4 py-3 font-bold text-[var(--nav-blue)] shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
    : "shrink-0 rounded-xl px-4 py-3 font-bold text-white/78 transition hover:bg-white/10 hover:text-white";

function AdminLayout() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-left">
      <aside className="border-b border-white/10 bg-[radial-gradient(circle_at_82%_8%,rgba(255,138,0,0.22),transparent_28%),linear-gradient(180deg,var(--nav-blue),#082744_58%,var(--brand))] p-4 text-white shadow-[0_24px_80px_rgba(18,60,105,0.26)] lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6">
        <h1 className="m-0 text-2xl font-black !text-white">BuyAdmin</h1>
        <p className="mt-2 text-sm font-semibold text-white/60">
          Operacion y control
        </p>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:mt-10 lg:flex-col lg:overflow-visible lg:pb-0">
          <NavLink className={adminLinkClass} to="/admin" end>
            Dashboard
          </NavLink>

          <NavLink className={adminLinkClass} to="/admin/products">
            Productos
          </NavLink>

          <div className="relative shrink-0 lg:shrink">
            <button
              onClick={() => setIsCategoriesOpen((prev) => !prev)}
              className="flex w-full min-w-max items-center justify-between gap-3 rounded-xl px-4 py-3 font-bold text-white/78 transition hover:bg-white/10 hover:text-white lg:min-w-0"
            >
              <span>Categorias</span>
              <ChevronDown
                size={18}
                className={`transition ${isCategoriesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isCategoriesOpen && (
              <div className="absolute z-20 mt-2 flex min-w-64 flex-col gap-1 rounded-2xl border border-white/10 bg-[#082744] p-2 shadow-xl lg:static lg:ml-4 lg:min-w-0 lg:border-l lg:border-white/20 lg:bg-transparent lg:p-0 lg:pl-3 lg:shadow-none">
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

      <main className="min-h-screen min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
