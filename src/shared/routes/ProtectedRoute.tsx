import { Navigate } from "react-router-dom";
import { useAuthSession } from "../utils/auth";

type ProtectedRouteProps = {
    children : React.ReactNode;
}

function ProtectedRoute({children} : ProtectedRouteProps) {
    const { status, user } = useAuthSession();

    if (status === "loading") {
        return <p className="text-slate-500">Cargando...</p>;
    }

    if(!user) {
        return <Navigate to="/login" replace/>;
    }

    return children;
}

export default ProtectedRoute;
