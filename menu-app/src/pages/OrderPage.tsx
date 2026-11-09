import { useEffect, useState } from "react";
import type { AuthUser } from "../types/AuthUser";
import type { Order } from "../types/Order";
import { isUnauthorized } from "../services/api";
import { cancelOrder, getMyOrders, payOrder } from "../services/orderService";
import { useAuth, useCurrentUser } from "../hooks/useAuth";
import OrderCard from "../components/OrderCard";

interface OrderPageProps {
    onBackToStore: () => void;
    // Pagar o cancelar cambia el stock: avisa para recargar el catálogo
    onStockChanged: () => void;
}

// Cada cuánto se vuelven a pedir las compras mientras se está en la página.
// Así se ve cómo avanzan solas (pago, envío y entrega simulados) sin recargar la página.
const REFRESH_INTERVAL_MS = 15_000;

function OrderPage({ onBackToStore, onStockChanged }: OrderPageProps) {
    const user = useCurrentUser();
    const { expireSession } = useAuth();
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [error, setError] = useState("");
    const [busyOrderId, setBusyOrderId] = useState<number | null>(null);

    const handleError = (err: unknown) => {
        if (isUnauthorized(err)) {
            expireSession();
            return;
        }
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    };

    //  Carga las compras al entrar a la página y las actualiza cada REFRESH_INTERVAL_MS hasta que se sale
    useEffect(() => {
        const loadOrders = () => {
            getMyOrders(user)
                .then(setOrders)
                .catch((err) => {
                    if (isUnauthorized(err)) {
                        expireSession();
                        return;
                    }
                    setError(err instanceof Error ? err.message : "No se pudieron cargar tus compras.");
                });
        };

        loadOrders();
        const intervalId = setInterval(loadOrders, REFRESH_INTERVAL_MS);
        return () => clearInterval(intervalId);
    }, [user, expireSession]);

    // Paga o cancela una compra y reemplaza esa compra en la lista con lo que devuelve el backend
    const runAction = async (idOrder: number, action: (user: AuthUser, idOrder: number) => Promise<Order>) => {
        setBusyOrderId(idOrder);
        setError("");
        try {
            const updated = await action(user, idOrder);
            setOrders((prev) => (prev ?? []).map((order) => (order.idOrder === idOrder ? updated : order)));
            onStockChanged();
        } catch (err) {
            handleError(err);
        } finally {
            setBusyOrderId(null);
        }
    };

    return (
        <main className="container-fluid px-4 py-4 admin-panel">
            {error && <p className="auth-error">{error}</p>}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h1 className="admin-title">Mis compras</h1>
                <button type="button" className="order-action-btn" onClick={onBackToStore}>
                    ← Volver a la tienda
                </button>
            </div>

            {orders === null ? (
                <p className="text-muted">Cargando compras...</p>
            ) : orders.length === 0 ? (
                <p className="text-center text-muted py-4">Todavía no hiciste ninguna compra</p>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.idOrder}
                            order={order}
                            busy={busyOrderId === order.idOrder}
                            onPay={(id) => runAction(id, payOrder)}
                            onCancel={(id) => runAction(id, cancelOrder)}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}

export default OrderPage;