import type { CartItem } from "../types/CartItem";

interface Props {
  cart: CartItem[];
  deleteProduct: (productID: number) => void
  incrementProduct: (productID: number) => void
  ressProduct: (productID: number) => void
  onCheckout: () => void
}

function Cart({ cart, deleteProduct, incrementProduct, ressProduct, onCheckout }: Props) {

  const total = cart.reduce((acc, item) => { return acc + (item.product.price * item.quantity) }, 0);

  return (
    <div className="card mb-4 border-0">
      <h6 className="text-center fw-bold fs-5 mb-3">Carrito web</h6>

      {
        cart.length == 0 ? (
          <p className="text-center text-muted py-4">No hay productos en el carrito</p>
        ) : (
          <>
            {
              cart.map((item) => (
                <div className="cart-item mb-3 pb-3" key={item.product.id}>
                  <div className="cart-item-thumb">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.title} />
                    ) : (
                      <span aria-hidden="true">🛍️</span>
                    )}
                  </div>

                  <div className="cart-item-info">
                    <h6 className="cart-item-title mb-1">{item.product.title}</h6>
                    <p className="cart-item-subtotal mb-2">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => ressProduct(item.product.id)}
                        aria-label={`Disminuir cantidad de ${item.product.title}`}
                      >
                        −
                      </button>
                      <span className="fw-medium">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => incrementProduct(item.product.id)}
                        disabled={item.quantity >= item.product.stock}
                        aria-label={`Aumentar cantidad de ${item.product.title}`}
                      >
                        +
                      </button>

                      <button
                        type="button"
                        className="cart-item-remove ms-auto"
                        onClick={() => deleteProduct(item.product.id)}
                        aria-label={`Eliminar ${item.product.title} del carrito`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }

            <div className="cart-summary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="cart-summary-label">Total</span>
                <span className="cart-summary-total">${total.toFixed(2)}</span>
              </div>
              <button
                type="button"
                className="btn btn-red-gradient w-100"
                onClick={onCheckout}
              >
                Finalizar compra
              </button>
            </div>
          </>
        )
      }
    </div>
  );


}

export default Cart;
