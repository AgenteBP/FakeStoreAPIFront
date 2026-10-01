import { useEffect, useState } from "react";

interface Slide {
  id: string;
  seed: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: "slide-1",
    seed: "tienda-slide1",
    title: "Hasta 30% OFF en Mochilas",
    subtitle: "Viajá y trabajá con estilo, por tiempo limitado.",
  },
  {
    id: "slide-2",
    seed: "tienda-slide2",
    title: "Nueva colección de indumentaria",
    subtitle: "Remeras, camperas y más, recién llegados.",
  },
  {
    id: "slide-3",
    seed: "tienda-slide3",
    title: "Envío gratis desde $50",
    subtitle: "Aprovechá antes de que termine la semana.",
  },
  {
    id: "slide-4",
    seed: "tienda-slide4",
    title: "Joyería seleccionada para vos",
    subtitle: "Piezas únicas con diseño exclusivo.",
  },
];

function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section
      className="banner-carousel"
      aria-roledescription="carousel"
      aria-label="Anuncios destacados"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="banner-track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {SLIDES.map((slide, index) => (
          <div
            className="banner-slide"
            key={slide.id}
            aria-hidden={index !== activeIndex}
          >
            <img
              src={`https://picsum.photos/seed/${slide.seed}/1200/400`}
              alt=""
              className="banner-slide-img"
            />
            <div className="banner-slide-overlay">
              <h2 className="banner-slide-title">{slide.title}</h2>
              <p className="banner-slide-subtitle">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="banner-arrow banner-arrow-prev"
        onClick={goToPrev}
        aria-label="Anuncio anterior"
      >
        ‹
      </button>
      <button
        type="button"
        className="banner-arrow banner-arrow-next"
        onClick={goToNext}
        aria-label="Siguiente anuncio"
      >
        ›
      </button>

      <div className="banner-dots">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`banner-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir al anuncio ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>
    </section>
  );
}

export default BannerCarousel;
