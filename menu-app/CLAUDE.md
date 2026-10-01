# menu-app

App de catálogo/carrito de compras. React 19 + TypeScript + Vite, estilos con Bootstrap 5.

## Comandos

- `npm run dev` — servidor de desarrollo (Vite)
- `npm run build` — `tsc -b` + build de producción
- `npm run lint` — ESLint
- `npm run preview` — preview del build

## Estructura

- `src/components/` — componentes de UI (Cart, Navbar, ProductCard, ProductModal)
- `src/hooks/` — hooks, ej. `useCart.ts` (lógica del carrito)
- `src/types/` — tipos compartidos: `Product.ts`, `CartItem.ts`
- `src/assets/` — imágenes

## Reglas y skills (`.agents/`)

Este proyecto define reglas y skills en `.agents/`. Esto es un resumen para tener el contexto siempre presente; ante cualquier duda releer el original.

### Regla: forma de trabajo frontend (`.agents/rules/frontend.MD`)

- Antes de escribir código, indicar qué archivos se van a modificar y qué
  cambios se harán en cada uno. Esperar el OK del usuario antes de empezar.
- Ante ambigüedad, preguntar antes de asumir. No inventar requisitos.
- Trabajar una tarea a la vez. Si el pedido es grande, proponer dividirlo en fases.
- Preferir componentes chicos y composición sobre componentes monolíticos.
- Preferir props inyectables, evitar efectos secundarios ocultos.
- No agregar dependencias nuevas sin justificarlo y sin aprobación del usuario.
- No modificar archivos ni lógica no relacionados con la tarea.
- Código simple, con comentarios solo donde la intención no sea obvia.
- Explicar el "por qué" de cambios no triviales en 1-2 líneas.
- Si un pedido choca con estas reglas o con los skills del proyecto, avisar en vez de ignorarlo en silencio.
- Dirigirse al usuario por su nombre, Braian, en cada respuesta.

### Skill: componentes de carrito (`.agents/skills/cart-components/SKILL.MD`)

Aplica al crear o modificar componentes en `src/components/`:

- **Tipado estricto**: interfaces/types explícitos para props; usar siempre
  las estructuras definidas de `Product` y `CartItem`.
- **Estado**: centralizar las acciones del carrito (agregar, remover,
  actualizar cantidad, calcular totales) en hooks o estado predecible
  (ver `useCart.ts`). Validar que las cantidades no sean negativas ni
  superen el stock.
- **Accesibilidad y estilos**: botones con `aria-label` descriptivos (ej.
  "Eliminar producto del carrito"); estilos modulares y limpios.
