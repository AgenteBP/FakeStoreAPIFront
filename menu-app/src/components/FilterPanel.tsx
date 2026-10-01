import { useState, type ReactNode } from "react";

interface Props {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
}

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
}

function AccordionSection({ title, children }: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="filter-accordion-section">
      <button
        type="button"
        className="filter-accordion-header"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className={`filter-accordion-arrow ${isOpen ? "open" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {isOpen && <div className="filter-accordion-body">{children}</div>}
    </div>
  );
}

function CategoryCheckboxList({
  categories,
  selectedCategories,
  onToggleCategory,
}: Pick<Props, "categories" | "selectedCategories" | "onToggleCategory">) {
  return (
    <ul className="category-list">
      {categories.map((category) => (
        <li key={category}>
          <label className="category-checkbox">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => onToggleCategory(category)}
            />
            <span>{category}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function PriceRangeFilter({
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
}: Pick<Props, "minPrice" | "maxPrice" | "priceRange" | "onPriceChange">) {
  const [minSelected, maxSelected] = priceRange;
  const span = maxPrice - minPrice || 1;
  const minPct = ((minSelected - minPrice) / span) * 100;
  const maxPct = ((maxSelected - minPrice) / span) * 100;

  const clamp = (value: number) => Math.min(Math.max(value, minPrice), maxPrice);

  return (
    <div className="price-filter">
      <div className="price-slider">
        <div className="price-slider-track">
          <div
            className="price-slider-range"
            style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
          />
        </div>
        <input
          type="range"
          className="price-slider-input"
          min={minPrice}
          max={maxPrice}
          value={minSelected}
          onChange={(e) => onPriceChange([Math.min(Number(e.target.value), maxSelected), maxSelected])}
          aria-label="Precio mínimo"
        />
        <input
          type="range"
          className="price-slider-input"
          min={minPrice}
          max={maxPrice}
          value={maxSelected}
          onChange={(e) => onPriceChange([minSelected, Math.max(Number(e.target.value), minSelected)])}
          aria-label="Precio máximo"
        />
      </div>

      <div className="price-inputs">
        <input
          type="number"
          className="price-input"
          min={minPrice}
          max={maxSelected}
          value={minSelected}
          onChange={(e) => {
            if (e.target.value === "") return;
            onPriceChange([Math.min(clamp(Number(e.target.value)), maxSelected), maxSelected]);
          }}
          aria-label="Precio mínimo"
        />
        <span className="price-inputs-sep">–</span>
        <input
          type="number"
          className="price-input"
          min={minSelected}
          max={maxPrice}
          value={maxSelected}
          onChange={(e) => {
            if (e.target.value === "") return;
            onPriceChange([minSelected, Math.max(clamp(Number(e.target.value)), minSelected)]);
          }}
          aria-label="Precio máximo"
        />
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  selectedCategories,
  onToggleCategory,
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters =
    selectedCategories.length > 0 || priceRange[0] !== minPrice || priceRange[1] !== maxPrice;

  const panelBody = (
    <>
      <AccordionSection title="Categorías">
        <CategoryCheckboxList
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={onToggleCategory}
        />
      </AccordionSection>

      <AccordionSection title="Precio">
        <PriceRangeFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceRange={priceRange}
          onPriceChange={onPriceChange}
        />
      </AccordionSection>
    </>
  );

  return (
    <>
      {/* Botón que abre el panel de filtros; solo visible en mobile */}
      <button
        type="button"
        className="category-filter-toggle d-md-none position-relative"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir filtros"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          viewBox="0 0 24 24"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="17" x2="14" y2="17" />
        </svg>
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="category-filter-toggle-badge" aria-hidden="true"></span>
        )}
      </button>

      {/* Panel fijo en desktop */}
      <aside className="category-sidebar d-none d-md-block">{panelBody}</aside>

      {/* Panel deslizante en mobile (mismo patrón que el drawer del carrito, desde la izquierda) */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 category-drawer-overlay"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="position-fixed top-0 start-0 h-100 p-4 overflow-y-auto category-drawer-panel"
            style={{ width: "min(320px, 85vw)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 category-drawer-header">
              <h5 className="mb-0 fw-bold">Filtros</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar filtros"
                onClick={() => setIsOpen(false)}
              ></button>
            </div>

            {panelBody}
          </div>
        </div>
      )}
    </>
  );
}

export default FilterPanel;
