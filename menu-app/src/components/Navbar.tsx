import { useEffect, useState } from "react";
import type { CartItem } from "../types/CartItem";
import type { AuthUser } from "../types/AuthUser";
import Cart from "./Cart";

interface NavbarProps {
  cart: CartItem[];
  totalItems: number;
  deleteProduct: (productID: number) => void;
  incrementProduct: (productID: number) => void;
  ressProduct: (productID: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  user: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onCheckout: () => void;
  onOpenOrders: () => void;
  onOpenAdmin: () => void;
}

function Navbar({
  cart,
  totalItems,
  deleteProduct,
  incrementProduct,
  ressProduct,
  searchTerm,
  onSearchChange,
  user,
  onOpenLogin,
  onLogout,
  onCheckout,
  onOpenOrders,
  onOpenAdmin,
}: NavbarProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg navbar-app sticky-top px-3 ${isScrolled ? "navbar-scrolled" : ""
          }`}
      >
        <div className="container-fluid">
          <div className="d-flex align-items-center gap-3 navbar-brand-search">
            <span className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 mb-0">
              🛒 Tienda Online
            </span>

            <div className="navbar-search-wrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                fill="currentColor"
                className="bi bi-search navbar-search-icon"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>
              <input
                type="search"
                className="navbar-search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="cart-btn position-relative d-flex align-items-center gap-2"
              onClick={toggleCart}
              aria-label="Abrir resumen del carrito de compras"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-cart3"
                viewBox="0 0 16 16"
              >
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l.84 4.479 9.144-.459L13.89 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
              </svg>
              <span>Carrito</span>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>

            <div className="position-relative">
              <button
                type="button"
                className="navbar-account-btn"
                onClick={() =>
                  user ? setIsAccountMenuOpen((prev) => !prev) : onOpenLogin()
                }
                aria-label={user ? `Cuenta de ${user.name}` : "Iniciar sesión"}
                title={user ? user.name : "Iniciar sesión"}
              >
                {user ? (
                  <span className="navbar-account-avatar" aria-hidden="true">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-person-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path
                      fillRule="evenodd"
                      d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                    />
                  </svg>
                )}
              </button>

              {user && isAccountMenuOpen && (
                <div className="navbar-account-menu">
                  <p className="navbar-account-menu-name">{user.name}</p>
                  <p className="navbar-account-menu-email">{user.email}</p>
                  <button
                    type="button"
                    className="navbar-account-link"
                    onClick={() => {
                      onOpenOrders();
                      setIsAccountMenuOpen(false);
                    }}
                  >
                    Mis compras
                  </button>
                  {user.role === "ADMIN" && (
                    <button
                      type="button"
                      className="navbar-account-link"
                      onClick={() => {
                        onOpenAdmin();
                        setIsAccountMenuOpen(false);
                      }}
                    >
                      Panel de administración
                    </button>
                  )}
                  <button
                    type="button"
                    className="navbar-account-logout"
                    onClick={() => {
                      onLogout();
                      setIsAccountMenuOpen(false);
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Panel lateral (Offcanvas) para el resumen del carrito */}
      {isCartOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 cart-drawer-overlay"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="position-fixed top-0 end-0 h-100 p-4 overflow-y-auto cart-drawer-panel"
            style={{ width: "min(420px, 90vw)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 cart-drawer-header">
              <h5 className="mb-0 fw-bold">Tu Carrito</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar panel del carrito"
                onClick={() => setIsCartOpen(false)}
              ></button>
            </div>

            <Cart
              cart={cart}
              deleteProduct={deleteProduct}
              incrementProduct={incrementProduct}
              ressProduct={ressProduct}
              onCheckout={() => {
                setIsCartOpen(false);
                onCheckout();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
