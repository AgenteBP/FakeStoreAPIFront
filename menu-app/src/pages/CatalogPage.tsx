import { useState } from "react";
import type { Product } from "../types/Product";
import BannerCarousel from "../components/BannerCarousel";
import FilterPanel from "../components/FilterPanel";
import ProductCard from "../components/ProductCard";
import ProductModal from "../components/ProductModal";
import { useProductFilters } from "../hooks/useProductFilters";

interface CatalogPageProps {
    products: Product[];                     // App lo carga y lo actualiza
    searchTerm: string;                      // lo escribe Navbar, que es hermano
    onAddToCart: (product: Product) => void; // handleAddToCart (chequea el login y muestra el toast)
}

function CatalogPage({ products, searchTerm, onAddToCart }: CatalogPageProps) {

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const {
        setPriceRange,
        handleToggleCategory,
        categories,
        effectivePriceRange,
        filteredProducts,
        maxPrice,
        minPrice,
        selectedCategories
    } = useProductFilters(products, searchTerm);

    return (
        <>
            <BannerCarousel />

            <main className="container-fluid px-4 py-4">

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