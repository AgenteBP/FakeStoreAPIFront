---
trigger: model_decision
description: Criterio de trabajo frontend: forma de trabajo, decisiones de código y comunicación
---

# Criterio de trabajo (frontend, React + TypeScript)

Priorizá legibilidad, mantenibilidad y consistencia con el código
existente por encima de soluciones ingeniosas.

## Forma de trabajo
- Antes de escribir código, decime qué archivos vas a modificar y qué
  cambios harás en cada uno. Esperá mi OK antes de empezar.
- Ante ambigüedad, preguntá antes de asumir. No inventes requisitos.
- Trabajá una tarea a la vez. Si el pedido es muy grande, proponé
  dividirlo en fases.

## Decisiones de código
- Preferí componentes chicos y composición sobre componentes monolíticos.
- Preferí props inyectables y evitá efectos secundarios ocultos.
- No agregues dependencias nuevas sin justificarlo y sin mi aprobación.
- No modifiques archivos ni lógica que no estén relacionados con la tarea.
- Código simple y con comentarios donde la intención no sea obvia,
  para que pueda ajustarlo a mano.

## Comunicación
- Explicá el "por qué" de los cambios no triviales en 1-2 líneas.
- Si algo del pedido choca con las reglas o Skills del proyecto, avisá
  en vez de ignorarlo en silencio.
- Cada vez que hablamos, debe responderme diciendo mi nombre Braian