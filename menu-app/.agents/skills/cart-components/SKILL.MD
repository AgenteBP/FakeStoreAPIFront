---
name: cart-components
description: Pautas y buenas prácticas para la creación y mantenimiento de componentes de catálogo y carrito de compras en React y TypeScript.
---
# Estándares de Componentes de Carrito
Al crear o modificar componentes dentro de `menu-app/src/components/`:
1. **Tipado Estricto**:
   - Usar siempre interfaces o types explícitos para las props.
   - Definir siempre las estructuras de `Product` y `CartItem`.
2. **Manejo del Estado**:
   - Centralizar las acciones del carrito (agregar, remover, actualizar cantidad, calcular totales) mediante hooks o estado predecible.
   - Validar que las cantidades no sean negativas ni superen el stock.
3. **Accesibilidad y Estilos**:
   - Botones con `aria-label` descriptivos (ej. "Eliminar producto del carrito").
   - Mantener estilos modulares y limpios.