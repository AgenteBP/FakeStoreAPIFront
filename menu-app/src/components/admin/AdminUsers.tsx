import { useEffect, useState } from "react";
import type { AdminUser } from "../../types/Admin";
import { activateUser, deactivateUser, getUsers } from "../../services/adminService";
import { useApiError } from "../../hooks/useApiError";
import { useCurrentUser } from "../../hooks/useAuth";

interface AdminUsersProps {
  // La baja cancela compras y devuelve stock: avisa para recargar el catálogo
  onStockChanged: () => void;
}

// Lista de usuarios con baja lógica y reactivación
function AdminUsers({ onStockChanged }: AdminUsersProps) {
  const admin = useCurrentUser();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  // Usuario al que se le tocó "Dar de baja" y espera confirmación
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const { error, handleError, clearError } = useApiError();

  useEffect(() => {
    getUsers(admin).then(setUsers).catch(handleError);
  }, [admin, handleError]);

  const replaceUser = (updated: AdminUser) =>
    setUsers((prev) => (prev ?? []).map((u) => (u.idUser === updated.idUser ? updated : u)));

  const handleDeactivate = async (user: AdminUser) => {
    setBusyId(user.idUser);
    setConfirmingId(null);
    clearError();
    try {
      const result = await deactivateUser(admin, user.idUser);
      replaceUser(result.user);
      setNotice(`${user.userName} quedó dado de baja. Compras canceladas: ${result.cancelledOrders}.`);
      if (result.cancelledOrders > 0) onStockChanged();
    } catch (err) {
      handleError(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (user: AdminUser) => {
    setBusyId(user.idUser);
    clearError();
    try {
      replaceUser(await activateUser(admin, user.idUser));
      setNotice(`${user.userName} fue reactivado.`);
    } catch (err) {
      handleError(err);
    } finally {
      setBusyId(null);
    }
  };

  if (users === null) {
    return error ? <p className="auth-error">{error}</p> : <p className="text-muted">Cargando usuarios...</p>;
  }

  return (
    <>
      {error && <p className="auth-error">{error}</p>}
      {notice && <p className="admin-notice">{notice}</p>}

      <div className="table-responsive">
        <table className="table align-middle admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Alta</th>
              <th>Estado</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.idUser} className={user.active ? "" : "admin-row-inactive"}>
                <td>
                  <div className="fw-semibold">{user.userName}</div>
                  <div className="admin-subtext">{user.email}</div>
                </td>
                <td>{user.role}</td>
                <td>{user.registrationDate ?? "—"}</td>
                <td>
                  <span className={`order-status ${user.active ? "order-status-delivered" : "order-status-cancelled"}`}>
                    {user.active ? "Activo" : "De baja"}
                  </span>
                </td>
                <td className="text-end">
                  <UserActions
                    user={user}
                    isSelf={user.idUser === admin.idUser}
                    confirming={confirmingId === user.idUser}
                    busy={busyId === user.idUser}
                    onAskDeactivate={() => setConfirmingId(user.idUser)}
                    onCancelConfirm={() => setConfirmingId(null)}
                    onDeactivate={() => handleDeactivate(user)}
                    onActivate={() => handleActivate(user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface UserActionsProps {
  user: AdminUser;
  isSelf: boolean;
  confirming: boolean;
  busy: boolean;
  onAskDeactivate: () => void;
  onCancelConfirm: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

// Botones de una fila. La baja pide confirmar porque cancela las compras del usuario.
function UserActions(props: UserActionsProps) {
  const { user, isSelf, confirming, busy } = props;

  if (isSelf) {
    return <span className="admin-subtext">Tu cuenta</span>;
  }
  if (!user.active) {
    return (
      <button type="button" className="order-action-btn" onClick={props.onActivate} disabled={busy}>
        Reactivar
      </button>
    );
  }
  if (confirming) {
    return (
      <div className="d-inline-flex align-items-center gap-2">
        <span className="admin-subtext">¿Dar de baja y cancelar sus compras pendientes y pagadas?</span>
        <button type="button" className="order-action-btn" onClick={props.onCancelConfirm}>
          No
        </button>
        <button type="button" className="btn btn-red-gradient btn-sm" onClick={props.onDeactivate}>
          Sí, dar de baja
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="order-action-btn"
      onClick={props.onAskDeactivate}
      disabled={busy}
      aria-label={`Dar de baja a ${user.userName}`}
    >
      {busy ? "Procesando..." : "Dar de baja"}
    </button>
  );
}

export default AdminUsers;
