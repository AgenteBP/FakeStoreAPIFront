import { useState, useEffect, useCallback } from "react";
import type { Product } from "./types/Product";
import type { AuthUser } from "./types/AuthUser";

import { useCart } from "./hooks/useCart";
import { useAuth } from "./hooks/useAuth";
import { getProducts } from "./services/productService";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import Toast from "./components/Toast";
import FilterPanel from "./components/FilterPanel";
import BannerCarousel from "./components/BannerCarousel";
import LoginModal from "./components/LoginModal";
import CheckoutModal from "./components/CheckoutModal";
import MyOrdersModal from "./components/MyOrdersModal";
import AdminPanel from "./components/admin/AdminPanel";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Agregado");
  const [toastKey, setToastKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  // Producto que se quiso agregar sin estar logueado: se agrega al carrito apenas inicia sesión
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const { user, isLoginOpen, signIn, signOut, openLogin, closeLogin } = useAuth();

  const {
    cart,
    addToCart,
    deleteProduct,
    incrementProduct,
    ressProduct,
    clearCart,
    totalItems,
  } = useCart();

  // toastKey se incrementa en cada click: si el toast ya estaba visible,
  // fuerza el remount de <Toast> para reiniciar su temporizador de auto-cierre.
  const addAndNotify = useCallback(
    (product: Product) => {
      const added = addToCart(product);
      setToastMessage(added ? "Agregado" : "No hay más stock");
      setShowToast(true);
      setToastKey((k) => k + 1);
    },
    [addToCart]
  );

  // Para comprar hay que estar logueado: sin sesión se guarda el producto y se abre el login
  const handleAddToCart = useCallback(
    (product: Product) => {
      if (!user) {
        setPendingProduct(product);
        openLogin();
        return;
      }
      addAndNotify(product);
    },
    [user, addAndNotify, openLogin]
  );

  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    signIn(loggedInUser);
    if (pendingProduct) {
      addAndNotify(pendingProduct);
      setPendingProduct(null);
    }
  };

  const handleCloseLogin = useCallback(() => {
    closeLogin();
    setPendingProduct(null);
  }, [closeLogin]);

  // El carrito es de cada usuario: al cerrar sesión se vacía.
  // Si en cambio vence el token (expireSession en AuthProvider), el carrito se conserva
  // y, al volver a iniciar sesión, se sigue en la pantalla donde estaba.
  const handleLogout = () => {
    signOut();
    clearCart();
    setShowCheckout(false);
    setShowOrders(false);
    setShowAdmin(false);
  };

  // Vuelve a traer el catálogo para mostrar el stock actualizado (después de comprar, pagar o cancelar).
  // Si falla, se sigue mostrando el catálogo anterior.
  const refreshProducts = useCallback(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {});
  }, []);

  // El backend ya reservó el stock: se vacía el carrito y se actualiza el catálogo
  const handleOrderCreated = () => {
    clearCart();
    refreshProducts();
  };

  const handleCloseCheckout = useCallback(() => setShowCheckout(false), []);
  const handleCloseOrders = useCallback(() => setShowOrders(false), []);

  const handleOpenOrders = () => {
    setShowCheckout(false);
    setShowOrders(true);
  };

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
    getProducts()
      .then((data) => {
        setProducts(data);
        const prices = data.map((prod) => prod.price);
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
        onLogout={handleLogout}
        onCheckout={() => setShowCheckout(true)}
        onOpenOrders={handleOpenOrders}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      {/* El panel reemplaza al catálogo mientras está abierto; solo existe para un ADMIN logueado */}
      {user?.role === "ADMIN" && showAdmin ? (
        <AdminPanel
          onBackToStore={() => setShowAdmin(false)}
          onStockChanged={refreshProducts}
        />
      ) : (
        <>
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
        </>
      )}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={handleAddToCart}
      />

      <Toast
        key={toastKey}
        show={showToast}
        message={toastMessage}
        onClose={handleToastClose}
      />

      <LoginModal
        show={isLoginOpen}
        onClose={handleCloseLogin}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Se montan solo cuando están abiertos y hay sesión: cada apertura arranca con datos frescos */}
      {user && showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={handleCloseCheckout}
          onOrderCreated={handleOrderCreated}
          onOpenOrders={handleOpenOrders}
        />
      )}

      {user && showOrders && (
        <MyOrdersModal
          onClose={handleCloseOrders}
          onStockChanged={refreshProducts}
        />
      )}
    </>
  );
}

export default App;
