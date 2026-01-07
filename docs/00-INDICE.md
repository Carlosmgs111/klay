# Índice General - Documentación MindMapAI

## 📑 Navegación Rápida

| # | Documento | Descripción | Páginas | Audiencia |
|---|-----------|-------------|---------|-----------|
| 0 | [**README**](./README.md) | Guía de la documentación | - | Todos |
| 1 | [**Problema y Solución**](./01-PROBLEMA-Y-SOLUCION.md) | Análisis del problema y propuesta de valor | ~15 | Stakeholders, PM |
| 2 | [**Arquitectura del Sistema**](./02-DIAGRAMA-ARQUITECTURA.md) | Diseño arquitectónico completo | ~20 | Arquitectos, Devs |
| 3 | [**Flujo de Datos**](./03-DIAGRAMA-FLUJO-DATOS.md) | Diagramas de flujo detallados | ~18 | Desarrolladores, QA |
| 4 | [**Diagramas C4**](./04-DIAGRAMAS-C4.md) | Modelo C4 completo (4 niveles) | ~22 | Arquitectos, DevOps |
| 5 | [**Proceso de Desarrollo**](./05-PROCESO-COMPLETO-DESARROLLO.md) | Ideación → Ejecución end-to-end | ~35 | Todo el equipo |

**Total**: ~110 páginas de documentación técnica

---

## 🎯 Guías de Lectura por Rol

### 👨‍💼 Product Manager / Stakeholder
**Tiempo estimado**: 30 minutos
1. 📖 [01-PROBLEMA-Y-SOLUCION.md](./01-PROBLEMA-Y-SOLUCION.md) - Completo
2. 📖 [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md) - Fases 1-3, 6, 10
3. 📊 [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md) - Solo sección de arquitectura general

### 🏗️ Arquitecto de Software
**Tiempo estimado**: 2 horas
1. 📖 [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md) - Completo
2. 📖 [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md) - Completo
3. 📖 [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md) - Fase 5 (ADRs)
4. 📖 [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md) - Revisar flujos críticos

### 👨‍💻 Desarrollador Backend
**Tiempo estimado**: 1.5 horas
1. 📖 [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md) - Backend Layer
2. 📖 [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md) - Nivel 3 (Backend) y Nivel 4
3. 📖 [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md) - Pipeline de conocimiento, Vector search
4. 📖 [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md) - Fases 7-8 (Desarrollo, Testing)

### 👨‍💻 Desarrollador Frontend
**Tiempo estimado**: 1.5 horas
1. 📖 [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md) - Frontend Layer
2. 📖 [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md) - Nivel 3 (Frontend)
3. 📖 [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md) - Flujo de estado, Chat UI, Mindmap
4. 📖 [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md) - Fases 7-8 (Desarrollo, Testing)

### 🧪 QA Engineer
**Tiempo estimado**: 1 hora
1. 📖 [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md) - Todos los flujos
2. 📖 [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md) - Fase 8 (Testing)
3. 📖 [01-PROBLEMA-Y-SOLUCION.md](./01-PROBLEMA-Y-SOLUCION.md) - Casos de uso

### 🚀 DevOps / SRE
**Tiempo estimado**: 45 minutos
1. 📖 [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md) - Infrastructure Layer, Deployment
2. 📖 [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md) - Nivel 2 (Contenedores)
3. 📖 [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md) - Fase 9 (Deployment)

### 🆕 Nuevo Miembro del Equipo (Onboarding)
**Tiempo estimado**: 3-4 horas
1. 📖 [README.md](./README.md) - Guía general
2. 📖 [01-PROBLEMA-Y-SOLUCION.md](./01-PROBLEMA-Y-SOLUCION.md) - Completo
3. 📖 [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md) - Completo
4. 📖 [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md) - Completo
5. 📖 [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md) - Niveles 1-3
6. 📖 [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md) - Pipeline principal

---

## 📊 Contenido por Tema

### 🎯 Estrategia y Producto
- [01-PROBLEMA-Y-SOLUCION.md](./01-PROBLEMA-Y-SOLUCION.md)
  - Problema identificado
  - Propuesta de valor
  - Casos de uso
  - Ventajas competitivas
  - Métricas de impacto

### 🏗️ Arquitectura
- [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md)
  - Arquitectura en capas
  - Módulos backend
  - Features frontend
  - Tecnologías
- [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md)
  - C4 Nivel 1: Contexto
  - C4 Nivel 2: Contenedores
  - C4 Nivel 3: Componentes
  - C4 Nivel 4: Código

### 🔄 Flujos y Procesos
- [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md)
  - Pipeline de conocimiento
  - Vector search
  - Chat RAG
  - Generación de mindmap
  - Upload multi-environment
  - Sincronización de estado

### 📋 Metodología y Procesos
- [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md)
  - Ideación y validación
  - Requerimientos
  - Mapeo del dominio (DDD)
  - ADRs (Architectural Decision Records)
  - Planeación (roadmap, sprints)
  - Desarrollo y testing
  - Deployment y operaciones
  - Iteración continua

---

## 🔍 Búsqueda Rápida por Concepto

### Conceptos de Arquitectura
- **Clean Architecture**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md), [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#adr-001)
- **DDD (Domain-Driven Design)**: [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#fase-4-mapeo-del-dominio)
- **Repository Pattern**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md)
- **Strategy Pattern**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#adr-007)

### Tecnologías
- **Astro SSR**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#adr-002)
- **React**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md), [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#adr-003)
- **Nanostores**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md), [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#adr-004)
- **LevelDB / IndexedDB**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md)

### Funcionalidades
- **RAG (Retrieval Augmented Generation)**: [01-PROBLEMA-Y-SOLUCION.md](./01-PROBLEMA-Y-SOLUCION.md), [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md#flujo-de-chat-con-rag)
- **Vector Search**: [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md#flujo-de-búsqueda-semántica)
- **Chunking**: [02-DIAGRAMA-ARQUITECTURA.md](./02-DIAGRAMA-ARQUITECTURA.md), [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md), [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#sprint-7-8)
- **Embeddings**: [01-PROBLEMA-Y-SOLUCION.md](./01-PROBLEMA-Y-SOLUCION.md), [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md), [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md)
- **Mindmaps**: [01-PROBLEMA-Y-SOLUCION.md](./01-PROBLEMA-Y-SOLUCION.md), [03-DIAGRAMA-FLUJO-DATOS.md](./03-DIAGRAMA-FLUJO-DATOS.md#flujo-de-generación-de-mindmap), [04-DIAGRAMAS-C4.md](./04-DIAGRAMAS-C4.md)

### Procesos de Desarrollo
- **MVP y Validación**: [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#fase-2-validación)
- **Requerimientos**: [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#fase-3-identificación-de-requerimientos)
- **Agregados y Bounded Contexts**: [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#42-identificación-de-agregados)
- **ADRs**: [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#51-decisiones-arquitectónicas-adrs)
- **Testing**: [05-PROCESO-COMPLETO-DESARROLLO.md](./05-PROCESO-COMPLETO-DESARROLLO.md#fase-8-testing-y-calidad)

---

## 📈 Estadísticas de la Documentación

### Cobertura Documental
- ✅ Problema y solución: 100%
- ✅ Arquitectura: 100%
- ✅ Flujos de datos: 100%
- ✅ Modelo C4: 100%
- ✅ Procesos: 100%

### Diagramas
- **Total de diagramas Mermaid**: 15+
- **Tipos**: Architecture, Sequence, Flowchart, Gantt, Class

### Ejemplos de Código
- **TypeScript**: 10+ snippets
- **Configuración**: 5+ examples
- **Tests**: 3+ examples

---

## 🔄 Mantenimiento de la Documentación

### Cuándo Actualizar

**Actualización Obligatoria**:
- ✅ Cambios arquitectónicos mayores (ADRs nuevos)
- ✅ Nuevos módulos o features
- ✅ Cambios en flujos principales
- ✅ Nuevas decisiones de tecnología

**Actualización Recomendada**:
- ⚠️ Optimizaciones de rendimiento significativas
- ⚠️ Cambios en proceso de desarrollo
- ⚠️ Nuevos patrones implementados

**Actualización Opcional**:
- 💡 Mejoras menores
- 💡 Refactorings internos
- 💡 Correcciones de bugs

### Proceso de Actualización

1. **Identificar documentos afectados**
2. **Actualizar contenido y diagramas**
3. **Revisar links internos**
4. **Actualizar tabla de versiones**
5. **PR con label `documentation`**
6. **Review por arquitecto o tech lead**

---

## 📞 Soporte

**Preguntas sobre la documentación**:
- GitHub Issues con label `documentation`
- Email: [documentacion@mindmapai.com]
- Slack: #architecture-docs

**Reportar errores**:
- Typos o errores menores: PR directo
- Errores técnicos: GitHub Issue con detalles

---

## 📅 Versionamiento

| Versión Docs | Versión App | Fecha | Cambios Principales |
|--------------|-------------|-------|---------------------|
| 1.0.0 | 0.0.1 | 2026-01-07 | Documentación inicial completa |

---

**Generado**: 2026-01-07
**Estado**: ✅ Completo y actualizado
**Próxima revisión**: Al finalizar Sprint 20

---

[⬆️ Volver arriba](#índice-general---documentación-mindmapai)
