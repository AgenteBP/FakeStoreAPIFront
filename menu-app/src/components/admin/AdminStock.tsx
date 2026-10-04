import { useEffect, useState } from "react";
import type { AuthUser } from "../../types/AuthUser";
import type { StockItem } from "../../types/Admin";
import { getStock, restockProduct } from "../../services/adminService";
import { useApiError } from "../../hooks/useApiError";

interface AdminStockProps {
  admin: AuthUser;
  onSessionExpired: () => void;
  onStockChanged: () => void;
}

// Stock de todos los productos (los de menos disponible primero) y reposición por producto
function AdminStock({ admin, onSessionExpired, onStockChanged }: AdminStockProps) {
  const [stock, setStock] = useState<StockItem[] | null>(null);
  // Lo que el ADMIN escribió en el campo "Unidades" de cada producto, por id de producto
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const { error, handleError, clearError } = useApiError(onSessionExpired);

  useEffect(() => {
    getStock(admin).then(setStock).catch(handleError);
  }, [admin, handleError]);

  const handleRestock = async (item: StockItem) => {
    const quantity = Number(quantities[item.idProduct]);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setNotice("");
      handleError(new Error("Ingresá una cantidad entera mayor a 0."));
      return;
    }

    setBusyId(item.idProduct);
    clearError();
    try {
      await restockProduct(admin, item.idProduct, quantity);
      // Se vuelve a pedir la lista para mostrar el stock real (otra compra pudo moverlo mientras tanto)
      setStock(await getStock(admin));
      setQuantities((prev) => ({ ...prev, [item.idProduct]: "" }));
      setNotice(`Se sumaron ${quantity} unidades a ${item.productName}.`);
      onStockChanged();
    } catch (err) {
      handleError(err);
    } finally {
      setBusyId(null);
    }
  };

  if (stock === null) {
    return error ? <p className="auth-error">{error}</p> : <p className="text-muted">Cargando stock...</p>;
  }

  return (
    <>
      {error && <p className="auth-error">{error}</p>}
      {notice && <p className="admin-notice">{notice}</p>}

      <div className="table-responsive">
        <table className="table align-middle admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="text-end">Disponible</th>
              <th className="text-end">Reservado</th>
              <th className="text-end">Reponer</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.idProduct}>
                <td>
                  <div className="fw-semibold admin-product-name">{item.productName}</div>
                  <div className="admin-subtext">
                    {item.sku}
                    {!item.active && " · desactivado"}
                  </div>
                </td>
                <td className={`text-end fw-semibold ${item.availableQuantity === 0 ? "admin-out-of-stock" : ""}`}>
                  {item.availableQuantity === 0 ? "Sin stock" : item.availableQuantity}
                </td>
                <td className="text-end">{item.reservedQuantity}</td>
                <td className="text-end">
                  <form
                    noValidate
                    className="d-inline-flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRestock(item);
                    }}
                  >
                    <input
                      id={`restock-${item.idProduct}`}
                      type="number"
                      min={1}
                      step={1}
                      className="auth-input admin-qty-input"
                      placeholder="Unidades"
                      value={quantities[item.idProduct] ?? ""}
                      onChange={(e) => setQuantities((prev) => ({ ...prev, [item.idProduct]: e.target.value }))}
                      aria-label={`Unidades a reponer de ${item.productName}`}
                    />
                    <button type="submit" className="btn btn-red-gradient btn-sm" disabled={busyId === item.idProduct}>
                      {busyId === item.idProduct ? "..." : "Reponer"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminStock;
