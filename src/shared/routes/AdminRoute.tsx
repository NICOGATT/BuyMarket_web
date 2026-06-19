import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

type AdminRouteProps = {
  children: React.ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const user = getUserFromToken();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;