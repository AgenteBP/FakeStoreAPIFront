import { useState, useEffect, useCallback } from "react";
import type { Product } from "./types/Product";
import type { AuthUser } from "./types/AuthUser";

import { useCartContext } from "./hooks/useCartContext";
import { useAuth } from "./hooks/useAuth";
import { useToast } from "./hooks/useToast";
import { getProducts } from "./services/productService";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import LoginModal from "./components/LoginModal";
import CheckoutModal from "./components/CheckoutModal";
import MyOrdersModal from "./components/MyOrdersModal";
import AdminPanel from "./components/admin/AdminPanel";
import CatalogPage from "./pages/CatalogPage";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  // Producto que se quiso agregar sin estar logueado: se agrega al carrito apenas inicia sesión
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const { user, isLoginOpen, signIn, signOut, openLogin, closeLogin } = useAuth();

  const { cart, addToCart, clearCart } = useCartContext();
  const { notify, toast } = useToast();

  const addAndNotify = useCallback(
    (product: Product) => {
      const added = addToCart(product);
      notify(added ? "Agregado" : "No hay más stock");
    },
    [addToCart, notify]
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
      .catch(() => { });
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



  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
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

        <CatalogPage
          products={products}
          searchTerm={searchTerm}
          onAddToCart={handleAddToCart}
        />
      )}


      <Toast
        key={toast.key}
        show={toast.show}
        message={toast.message}
        onClose={toast.onClose}
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
