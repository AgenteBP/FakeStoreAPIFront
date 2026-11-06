import { useState } from "react";
import type { Product } from "../types/Product";
import BannerCarousel from "../components/BannerCarousel";
import FilterPanel from "../components/FilterPanel";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";

interface CatalogPageProps {
    products: Product[];                     // App lo carga y lo actualiza
    searchTerm: string;                      // lo escribe Navbar, que es hermano
    onAddToCart: (product: Product) => void; // handleAddToCart (chequea el login y muestra el toast)
}

function CatalogPage({ products, searchTerm, onAddToCart }: CatalogPageProps) {

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

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

    return (
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
                                        addToCart={onAddToCart}
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
                addToCart={onAddToCart}
            />
        </>
    );
}

export default CatalogPage;