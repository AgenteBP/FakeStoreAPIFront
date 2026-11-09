import { useState } from "react";
import type { Product } from "../types/Product";

// Filtros del catálogo (búsqueda, categorías y precio): devuelve la lista filtrada
// y lo que necesita FilterPanel para mostrar y cambiar los filtros
export function useProductFilters(products: Product[], searchTerm: string) {
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

    return {
        handleToggleCategory,
        categories,
        minPrice,
        maxPrice,
        effectivePriceRange,
        filteredProducts,
        selectedCategories,
        setPriceRange
    };
}