import { Navigate } from "react-router-dom";
import { useAuthSession } from "../utils/auth";

type AdminRouteProps = {
  children: React.ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const { status, user } = useAuthSession();

  if (status === "loading") {
    return (
      <p className="p-10 text-center font-semibold text-slate-500">
        Cargando...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
