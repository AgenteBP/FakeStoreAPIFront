import { useEffect } from "react";
import type { Product } from "../types/Product";

interface Props {
  product: Product | null;
  onClose: () => void;
  addToCart: (product: Product) => void;
}

function ProductModal({ product, onClose, addToCart }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (product) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={onClose}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content modal-content-app border-0 shadow">
            <div className="modal-header border-bottom-0 pb-0">
              <h5 className="modal-title fs-5 fw-bold" id="product-modal-title">
                Detalle del Producto
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar modal de detalle"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4 align-items-center">
                <div className="col-md-5 text-center">
                  <div className="modal-image-frame" style={{ height: "360px" }}>
                    <img
                      src={product.image}
                      alt={product.title}
                      className="img-fluid"
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                    />
                  </div>
                </div>

                <div className="col-md-7 d-flex flex-column">
                  <h4 className="fs-4 fw-bold text-dark mb-2">{product.title}</h4>
                  <p className="fs-3 fw-bold product-price mb-3">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-secondary mb-4" style={{ lineHeight: 1.6 }}>
                    {product.description || "Sin descripción disponible."}
                  </p>

                  <div className="mt-auto pt-3">
                    <button
                      className="btn btn-primary btn-lg w-100"
                      onClick={() => {
                        addToCart(product);
                      }}
                      aria-label={`Agregar ${product.title} al carrito`}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductModal;
