import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

// Ruta de layout: con sesión muestra la página hija (<Outlet />); sin sesión (o si se cierra
// estando acá) vuelve al catálogo. replace evita que "atrás" vuelva a la ruta protegida y quede
// en un bucle de redirecciones.
function RequireAuth() {
    const { user } = useAuth();
    return user ? <Outlet /> : <Navigate to="/" replace />;
}


export default RequireAuth;