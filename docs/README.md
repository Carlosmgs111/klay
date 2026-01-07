# Documentación de Arquitectura - MindMapAI

## 📚 Índice de Documentación

Bienvenido a la documentación completa de arquitectura y procesos del proyecto **MindMapAI - Knowledge as a Service Platform**.

Esta documentación describe el proceso completo desde la ideación hasta la ejecución, incluyendo análisis del problema, diseño arquitectónico, mapeo del dominio y planeación detallada.

---

## 📖 Documentos Disponibles

### 1. [Problema y Solución](./01-PROBLEMA-Y-SOLUCION.md)
**Descripción**: Análisis del problema que resuelve MindMapAI y la propuesta de valor

**Contenido**:
- 🎯 Problema identificado (limitaciones de LLMs)
- 💡 Solución propuesta (Knowledge as a Service)
- 🔧 Cómo la solución resuelve el problema
- 📊 Métricas de impacto
- 🔐 Ventajas competitivas

**Audiencia**: Stakeholders, Product Managers, Inversionistas

---

### 2. [Diagrama de Arquitectura del Sistema](./02-DIAGRAMA-ARQUITECTURA.md)
**Descripción**: Arquitectura completa del sistema con diagramas detallados

**Contenido**:
- 📐 Arquitectura general del sistema
- 🏗️ Arquitectura en capas detallada
  - Frontend Layer (Astro SSR + React)
  - API Routes Layer
  - Backend Layer (Clean Architecture)
  - Infrastructure Layer
  - Data Storage Layer
- 🔄 Flujo de datos principal (3 flujos clave)
- 🎯 Principios arquitectónicos
- 📊 Tecnologías por capa

**Audiencia**: Arquitectos de Software, Desarrolladores Senior

---

### 3. [Diagramas de Flujo de Datos](./03-DIAGRAMA-FLUJO-DATOS.md)
**Descripción**: Flujos de datos detallados para cada proceso del sistema

**Contenido**:
- 📊 Pipeline de conocimiento completo (Upload → Extract → Chunk → Embed)
- 🔍 Flujo de búsqueda semántica (Vector Search)
- 💬 Flujo de chat con RAG
- 🧠 Flujo de generación de mindmap
- 📤 Flujo de upload y storage (Multi-Environment)
- 🔄 Flujo de sincronización de estado (Nanostores)
- 📈 Características de los flujos

**Audiencia**: Desarrolladores, QA Engineers

---

### 4. [Diagramas C4](./04-DIAGRAMAS-C4.md)
**Descripción**: Modelo C4 (Context, Containers, Components, Code) completo

**Contenido**:
- 📍 **Nivel 1 - Contexto**: Sistema en su entorno, usuarios, sistemas externos
- 📦 **Nivel 2 - Contenedores**: Aplicaciones, servicios, bases de datos
- 🔧 **Nivel 3 - Componentes**: Módulos backend, features frontend, APIs
- 💻 **Nivel 4 - Código**: Clases, interfaces, métodos (ejemplos)
- 🎯 Principios arquitectónicos reflejados
- 📈 Beneficios de la arquitectura C4

**Audiencia**: Arquitectos, Desarrolladores, DevOps

---

### 5. [Proceso Completo de Desarrollo](./05-PROCESO-COMPLETO-DESARROLLO.md)
**Descripción**: Proceso end-to-end desde ideación hasta ejecución y mejora continua

**Contenido**:
- 🌟 **Fase 1: Ideación** - Origen, visión, hipótesis
- ✅ **Fase 2: Validación** - MVP, validación técnica, mercado
- 📝 **Fase 3: Requerimientos** - Funcionales, no funcionales, casos de uso
- 🗺️ **Fase 4: Mapeo del Dominio** - Event Storming, agregados, bounded contexts
- 🏛️ **Fase 5: Diseño de Arquitectura** - ADRs, patrones, deployment
- 📅 **Fase 6: Planeación** - Roadmap, sprints, estimaciones
- 🔨 **Fase 7: Ejecución** - Metodología, git workflow, estándares
- 🧪 **Fase 8: Testing** - Unit, integration, E2E, QA
- 🚀 **Fase 9: Deployment** - Ambientes, configuración, monitoreo
- 🔄 **Fase 10: Iteración** - Feedback, métricas, roadmap futuro

**Audiencia**: Todo el equipo, Stakeholders, Nuevos desarrolladores

---

## 🎯 Guía de Lectura Recomendada

### Para Entender el Proyecto Rápidamente:
1. Lee **01-PROBLEMA-Y-SOLUCION.md** para contexto
2. Revisa **02-DIAGRAMA-ARQUITECTURA.md** sección de arquitectura general
3. Mira **03-DIAGRAMA-FLUJO-DATOS.md** pipeline de conocimiento

### Para Implementar Nuevas Features:
1. Revisa **04-DIAGRAMAS-C4.md** nivel 3 (componentes)
2. Lee **05-PROCESO-COMPLETO-DESARROLLO.md** fase 7 (estándares de código)
3. Consulta **03-DIAGRAMA-FLUJO-DATOS.md** para flujos relacionados

### Para Planificar Arquitectura:
1. Estudia **05-PROCESO-COMPLETO-DESARROLLO.md** fase 5 (ADRs)
2. Revisa **04-DIAGRAMAS-C4.md** completo
3. Consulta **02-DIAGRAMA-ARQUITECTURA.md** para patrones aplicados

### Para Onboarding de Nuevos Miembros:
1. Lee **05-PROCESO-COMPLETO-DESARROLLO.md** completo
2. Revisa **01-PROBLEMA-Y-SOLUCION.md**
3. Estudia **02-DIAGRAMA-ARQUITECTURA.md**
4. Práctica: Revisa **03-DIAGRAMA-FLUJO-DATOS.md** mientras exploras el código

---

## 📊 Diagramas Incluidos

Esta documentación incluye **15+ diagramas Mermaid**:

- ✅ Arquitectura general del sistema
- ✅ Pipeline de conocimiento completo
- ✅ Flujo de búsqueda semántica
- ✅ Flujo de chat RAG
- ✅ Flujo de generación de mindmap
- ✅ Flujo de upload multi-environment
- ✅ Sincronización de estado
- ✅ Diagrama C4 Nivel 1 (Contexto)
- ✅ Diagrama C4 Nivel 2 (Contenedores)
- ✅ Diagrama C4 Nivel 3 Backend (Componentes)
- ✅ Diagrama C4 Nivel 3 Frontend (Componentes)
- ✅ Diagrama C4 Nivel 4 Embeddings (Código)
- ✅ Diagrama C4 Nivel 4 Chunking (Código)
- ✅ Diagrama C4 Nivel 4 File Management (Código)
- ✅ Roadmap de desarrollo (Gantt)
- ✅ Proceso completo de desarrollo

---

## 🛠️ Tecnologías Documentadas

### Frontend
- Astro 5 (SSR)
- React 19
- Tailwind CSS 4
- Nanostores
- CodeMirror 6
- Markmap

### Backend
- Node.js
- TypeScript
- Clean Architecture
- Repository Pattern
- Strategy Pattern

### AI/ML
- HuggingFace SDK
- Cohere SDK
- AI SDK
- @xenova/transformers
- @mlc-ai/web-llm

### Storage
- LevelDB
- IndexedDB
- File System
- CSV

---

## 📌 Convenciones de Documentación

### Formato
- Todos los documentos están en **Markdown**
- Diagramas usando **Mermaid** (renderizables en GitHub)
- Ejemplos de código con syntax highlighting

### Estructura
Cada documento sigue:
1. Título y descripción
2. Tabla de contenidos
3. Secciones numeradas
4. Ejemplos visuales (diagramas)
5. Ejemplos de código cuando aplica
6. Conclusión/Resumen

### Mantenimiento
- **Actualizar** cuando se hagan cambios arquitectónicos significativos
- **Versionar** con el código (Git)
- **Revisar** en code reviews si afecta arquitectura

---

## 🎓 Recursos Adicionales

### Para Aprender Más:

**Clean Architecture**:
- 📖 "Clean Architecture" por Robert C. Martin
- 🔗 https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

**Domain-Driven Design**:
- 📖 "Domain-Driven Design" por Eric Evans
- 🔗 https://www.domainlanguage.com/ddd/

**C4 Model**:
- 🔗 https://c4model.com/

**RAG (Retrieval Augmented Generation)**:
- 📄 Paper: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
- 🔗 https://arxiv.org/abs/2005.11401

**Vector Search**:
- 📖 "Nearest Neighbor Search" algorithms
- 🔗 https://www.pinecone.io/learn/vector-database/

---

## 🤝 Contribuir a la Documentación

### Cómo Actualizar:

1. **Cambios Menores** (typos, clarificaciones):
   - Edita directamente el archivo .md
   - Commit con mensaje: `docs: fix typo in architecture diagram`

2. **Cambios Mayores** (nueva arquitectura, ADRs):
   - Crea branch: `docs/update-architecture-xxx`
   - Actualiza documentos relevantes
   - Actualiza diagramas si es necesario
   - PR con descripción detallada

3. **Nuevos Documentos**:
   - Sigue estructura existente
   - Agrega al índice (README.md)
   - Numera secuencialmente: `06-NUEVO-TEMA.md`

### Checklist de Calidad:

- [ ] Diagramas Mermaid renderizan correctamente
- [ ] Links internos funcionan
- [ ] Ejemplos de código tienen syntax highlighting
- [ ] Tabla de contenidos actualizada
- [ ] Audiencia target especificada
- [ ] Spell check ejecutado

---

## 📞 Contacto

Para preguntas sobre la documentación:

- **Email**: [tu-email@ejemplo.com]
- **GitHub Issues**: Crea un issue con label `documentation`
- **Slack**: Canal #architecture-docs

---

## 📅 Historial de Cambios

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0.0 | 2026-01-07 | Documentación inicial completa | Claude |

---

## 📄 Licencia

Esta documentación es parte del proyecto MindMapAI y está sujeta a la misma licencia del proyecto.

---

**Última actualización**: 2026-01-07
**Estado**: Documentación completa y actualizada
**Versión del proyecto**: 0.0.1
