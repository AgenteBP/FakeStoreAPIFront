import type { Product } from "../types/Product";
import { API_URL } from "./api";

// Forma en que el backend devuelve un producto (GET /api/products)
interface ProductResponse {
  idProduct: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryName: string;
  availableQuantity: number;
}

// El backend guarda rutas relativas (/images/products/1.png) para las imágenes que sirve él mismo,
// así que hay que anteponerle su dirección. Una URL completa se deja como está.
function toImageUrl(imageUrl: string | null): string | undefined {
  if (!imageUrl) return undefined;
  return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
}

// Traduce la respuesta del backend al tipo Product que usan los componentes
function toProduct(response: ProductResponse): Product {
  return {
    id: response.idProduct,
    title: response.name,
    description: response.description ?? undefined,
    price: response.price,
    image: toImageUrl(response.imageUrl),
    category: response.categoryName,
    stock: response.availableQuantity,
  };
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`);
  if (!response.ok) {
    throw new Error("Ocurrio un error en la carga de datos");
  }
  const data: ProductResponse[] = await response.json();
  return data.map(toProduct);
}
