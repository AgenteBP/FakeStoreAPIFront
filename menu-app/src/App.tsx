import { useState, useEffect, useCallback } from "react";
import type { Product } from "./types/Product";
import type { AuthUser } from "./types/AuthUser";

import { useCart } from "./hooks/useCart";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import Toast from "./components/Toast";
import FilterPanel from "./components/FilterPanel";
import BannerCarousel from "./components/BannerCarousel";
import LoginModal from "./components/LoginModal";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastKey, setToastKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const {
    cart,
    addToCart,
    deleteProduct,
    incrementProduct,
    ressProduct,
    totalItems,
  } = useCart();

  // toastKey se incrementa en cada click: si el toast ya estaba visible,
  // fuerza el remount de <Toast> para reiniciar su temporizador de auto-cierre.
  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      setShowToast(true);
      setToastKey((k) => k + 1);
    },
    [addToCart]
  );

  const handleToastClose = useCallback(() => setShowToast(false), []);

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const categories = Array.from(new Set(products.map((prod) => prod.category))).sort();
  const productPrices = products.map((prod) => prod.price);
  const minPrice = productPrices.length ? Math.floor(Math.min(...productPrices)) : 0;
  const maxPrice = productPrices.length ? Math.ceil(Math.max(...productPrices)) : 0;
  const effectivePriceRange: [number, number] = priceRange ?? [minPrice, maxPrice];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.title.toLowerCase().includes(normalizedSearch);
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(prod.category);
    const matchesPrice =
      prod.price >= effectivePriceRange[0] && prod.price <= effectivePriceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  useEffect(() => {
    fetch("https://fakestoreapi.com/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ocurrio un error en la carga de datos");
        }
        return response.json();
      })
      .then((data) => {
        console.log("🚀 ~ App ~ data:", data)
        setProducts(data);
        const prices = data.map((prod: Product) => prod.price);
        setPriceRange([Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError("Ocurrio un error al cargar los productos");
      });
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary me-2" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <h3 className="mb-0">Cargando productos...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <h2 className="text-danger">{error}</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar
        cart={cart}
        totalItems={totalItems}
        deleteProduct={deleteProduct}
        incrementProduct={incrementProduct}
        ressProduct={ressProduct}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        user={user}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={() => setUser(null)}
      />

      <BannerCarousel />

      <main className="container-fluid px-4 py-4">
        {/* {normalizedSearch === "" && (
          <h1 className="text-center fs-2 fw-bold mb-4 text-dark">
            Catálogo de Productos
          </h1>
        )} */}

        <div className="row g-2">
          <div className="col-12 col-md-auto">
            <FilterPanel
              categories={categories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              priceRange={effectivePriceRange}
              onPriceChange={setPriceRange}
            />
          </div>

          <div className="col-12 col-md">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted py-5">
                No se encontraron productos
              </p>
            ) : (
              <div className="row">
                {filteredProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    addToCart={handleAddToCart}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={handleAddToCart}
      />

      <Toast
        key={toastKey}
        show={showToast}
        message="Agregado"
        onClose={handleToastClose}
      />

      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setShowLoginModal(false);
        }}
      />
    </>
  );
}

export default App;
