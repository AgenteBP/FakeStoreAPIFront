import { useState } from "react";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";
import AdminStock from "./AdminStock";

interface AdminPanelProps {
  onBackToStore: () => void;
  onStockChanged: () => void;
}

type AdminTab = "users" | "orders" | "stock";

const TABS: { id: AdminTab; label: string }[] = [
  { id: "users", label: "Usuarios" },
  { id: "orders", label: "Compras" },
  { id: "stock", label: "Stock" },
];

// Pantalla del ADMIN con tres pestañas. Cada pestaña carga sus datos al abrirse.
function AdminPanel({ onBackToStore, onStockChanged }: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>("orders");

  const renderTab = () => {
    switch (tab) {
      case "users":
        return <AdminUsers onStockChanged={onStockChanged} />;
      case "orders":
        return <AdminOrders onStockChanged={onStockChanged} />;
      case "stock":
        return <AdminStock onStockChanged={onStockChanged} />;
    }
  };

  return (
    <main className="container-fluid px-4 py-4 admin-panel">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="admin-title">Panel de administración</h1>
        <button type="button" className="order-action-btn" onClick={onBackToStore}>
          ← Volver a la tienda
        </button>
      </div>

      <div className="admin-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="admin-card">{renderTab()}</section>
    </main>
  );
}

export default AdminPanel;
