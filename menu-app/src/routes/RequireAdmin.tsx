import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

// Ruta de layout: solo un ADMIN ve la página hija (<Outlet />). Sin sesión, o con sesión de
// cliente, vuelve al catálogo. replace evita que "atrás" vuelva a la ruta protegida y quede
// en un bucle de redirecciones.
function RequireAdmin() {
    const { user } = useAuth();
    return user?.role === "ADMIN" ? <Outlet /> : <Navigate to="/" replace />;
}


export default RequireAdmin;