import { Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";

type ProtectedRouteProps = {
    children : React.ReactNode; 
}

function ProtectedRoute({children} : ProtectedRouteProps) {
    const user = getUserFromToken(); 
    if(!user) {
        return <Navigate to="/login" replace/>; 
    }

    return children;
}

export default ProtectedRoute;
