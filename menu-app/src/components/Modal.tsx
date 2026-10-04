import { useEffect, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  size?: "md" | "lg";
  children: ReactNode;
}

// Contenedor de modal con el mismo estilo que LoginModal y ProductModal.
// Se renderiza solo mientras está abierto: quien lo usa decide cuándo montarlo.
// Cierra con Escape o clic afuera, y bloquea el scroll de la página mientras está abierto.
function Modal({ title, onClose, size = "md", children }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      onClick={onClose}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size === "lg" ? "modal-lg" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content modal-content-app border-0 shadow">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fs-5 fw-bold" id="app-modal-title">
              {title}
            </h5>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
