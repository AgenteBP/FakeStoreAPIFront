import type { Product } from "../types/Product";

interface Props {
  product: Product;
  addToCart: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

function ProductCard({ product, addToCart, onSelectProduct }: Props) {
  const outOfStock = product.stock === 0;

  return (
    <div className="col-12 col-md-4 mb-4">
      <div
        className="card h-100 product-card"
        style={{ cursor: "pointer" }}
        onClick={() => onSelectProduct && onSelectProduct(product)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelectProduct && onSelectProduct(product);
          }
        }}
      >
        <div
          className="d-flex justify-content-center align-items-center p-3 bg-white"
          style={{ height: "220px" }}
        >
          <img
            src={product.image}
            className="card-img-top"
            alt={product.title}
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
          />
        </div>
        <div className="card-body d-flex flex-column">
          <h5
            className="card-title product-title fs-6 fw-semibold mb-2"
            title={product.title}
          >
            {product.title}
          </h5>
          <p className="card-text fs-5 fw-bold text-primary mb-3">
            ${product.price.toFixed(2)}
          </p>
          <button
            className="btn btn-primary w-100 mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={outOfStock}
            aria-label={outOfStock ? `${product.title} sin stock` : `Agregar ${product.title} al carrito`}
          >
            {outOfStock ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;