# 📝 Ejemplos de Código: Antes vs Después

Este documento muestra ejemplos concretos de cómo cambia el código con la nueva arquitectura.

## 1. Imports en Páginas

### ❌ Antes (Rutas Relativas)

```astro
---
// pages/dashboard/generator.astro
import Layout from "../../layouts/Layout.astro";
import DashBoardLayout from "../../layouts/DashboardLayout.astro";
import LoadedFileSelector from "../../components/LoadedFileSelector.astro";
import FlowStep from "../../components/FlowStep.astro";
import { sc } from "../../utils/sc";
---
```

### ✅ Después (Path Aliases + Features)

```astro
---
// pages/dashboard/generator.astro
import Layout from "@/layouts/Layout.astro";
import DashBoardLayout from "@/layouts/DashboardLayout.astro";
import LoadedFileSelector from "@/features/file-management/components/LoadedFileSelector.astro";
import FlowStep from "@/features/mindmap-generator/components/FlowStep.astro";
import { sc } from "@/shared/utils/sc";
---
```

**Beneficios**:
- ✅ Rutas absolutas más legibles
- ✅ Organización clara por features
- ✅ Fácil de refactorizar

---

## 2. Componente de Feature

### ❌ Antes (Todo en components/)

```astro
---
// components/MarkmapView/index.astro
import { MarkMapViewer } from "./lib/MarkmapViewer";
---

<div class="markmap-container">
  <svg class="markmap-svg"></svg>
</div>

<script>
  import { MarkMapViewer } from "./lib/MarkmapViewer";
  import { currentMindmap } from "../../stores/currentMindmap";
  
  // ...código
</script>
```

### ✅ Después (Feature autocontenido)

```astro
---
// features/mindmap-editor/components/MarkmapViewer.astro
import { MarkMapViewer } from "../lib/MarkmapViewer";
---

<div class="markmap-container">
  <svg class="markmap-svg"></svg>
</div>

<script>
  import { MarkMapViewer } from "../lib/MarkmapViewer";
  import { currentMindmap } from "../stores/currentMindmap";
  
  // ...código
</script>
```

**Beneficios**:
- ✅ Imports relativos cortos dentro del feature
- ✅ Todo el código del mindmap-editor junto
- ✅ Fácil de encontrar y mantener

---

## 3. Store con Acciones

### ❌ Antes (Store simple)

```typescript
// stores/currentMindmap.ts
import { atom } from "nanostores";

export const currentMindmap = atom<string | null>(null);

export const appendToCurrentMindmap = (mindmap: string) => {
  const prev = currentMindmap.get();
  currentMindmap.set(prev + mindmap);
};
```

### ✅ Después (Store con más acciones)

```typescript
// features/mindmap-editor/stores/currentMindmap.ts
import { atom } from "nanostores";

/**
 * Store para el contenido actual del mindmap en formato Markdown
 */
export const currentMindmap = atom<string | null>(null);

/**
 * Añade contenido al mindmap actual (útil para streaming)
 */
export const appendToCurrentMindmap = (content: string) => {
  const prev = currentMindmap.get() || "";
  currentMindmap.set(prev + content);
};

/**
 * Limpia el contenido del mindmap
 */
export const clearMindmap = () => {
  currentMindmap.set(null);
};

/**
 * Reemplaza el contenido completo
 */
export const setMindmap = (content: string) => {
  currentMindmap.set(content);
};
```

**Beneficios**:
- ✅ API más completa del store
- ✅ Documentación clara
- ✅ Mejor experiencia de desarrollo

---

## 4. Componente Compartido

### ❌ Antes (Switch en components/)

```astro
---
// components/Switch.astro
import { sc } from "../utils/sc";
import { selectionMode } from "../stores/selectionMode";
---

<button role="switch">
  <!-- ...código -->
</button>
```

### ✅ Después (Switch en shared/ui)

```astro
---
// shared/components/ui/Switch.astro
import { sc } from "@/shared/utils/sc";

interface Props {
  id: string;
  label?: string;
  disabled?: boolean;
}
---

<button role="switch" data-switch-id={Astro.props.id}>
  <!-- ...código -->
</button>

<script>
  // Store específico se importa donde se usa, no en el componente
</script>
```

**Beneficios**:
- ✅ Componente más reutilizable
- ✅ No tiene dependencias de features específicos
- ✅ Props bien tipadas

---

## 5. Página Orquestadora

### ❌ Antes (Lógica en la página)

```astro
---
// pages/editor.astro
import Layout from "../layouts/Layout.astro";
import MindmapTextEditor from "../components/MindmapTextEditor/index.astro";
import MarkmapView from "../components/MarkmapView/index.astro";

// Lógica aquí...
---

<Layout>
  <div class="grid grid-cols-2">
    <MindmapTextEditor />
    <MarkmapView />
  </div>
</Layout>

<script>
  // Mucha lógica aquí...
  const generateMindmap = () => {
    // ...código
  };
</script>
```

### ✅ Después (Página delgada)

```astro
---
// pages/editor.astro
import Layout from '@/layouts/Layout.astro';
import MindmapTextEditor from '@/features/mindmap-editor/components/MindmapTextEditor.astro';
import MarkmapViewer from '@/features/mindmap-editor/components/MarkmapViewer.astro';
---

<Layout title="Editor | MindMapAI">
  <div class="grid grid-cols-2 gap-4 p-4 h-screen">
    <MindmapTextEditor />
    <MarkmapViewer />
  </div>
</Layout>

<script>
  // Lógica mínima, features manejan su propio estado
  import { appendToCurrentMindmap } from '@/features/mindmap-editor/stores/currentMindmap';
  import { fileStore } from '@/features/file-management/stores/files';
  
  // Solo orquestación
</script>
```

**Beneficios**:
- ✅ Página se enfoca en layout y composición
- ✅ Lógica en features donde pertenece
- ✅ Más fácil de testear

---

## 6. Uso de Tipos

### ❌ Antes (Tipos inline)

```typescript
// stores/files.ts
import { atom } from "nanostores";

type FileLoaded = {
  id: string;
  name: string;
};

export type IndexFile = {
  indexes: string[];
  stagedIndexes: string[];
  files: {
    [id: string]: File | FileLoaded | null;
  };
};

export const fileStore = atom<IndexFile>({...});
```

### ✅ Después (Tipos en archivo separado)

```typescript
// features/file-management/types/file.types.ts
export type FileLoaded = {
  id: string;
  name: string;
  size?: number;
  lastModified?: number;
  type?: string;
};

export type FileIndex = {
  indexes: string[];
  stagedIndexes: string[];
  files: {
    [id: string]: File | FileLoaded | null;
  };
};

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}
```

```typescript
// features/file-management/stores/files.ts
import { atom } from "nanostores";
import type { FileIndex } from "../types/file.types";

export const fileStore = atom<FileIndex>({...});
```

**Beneficios**:
- ✅ Tipos reutilizables
- ✅ Mejor organización
- ✅ IntelliSense mejorado

---

## 7. Componente con Dependencias

### ❌ Antes (Importa de múltiples lugares)

```astro
---
// components/LibraryFileSelector.astro
import Switch from "./Switch.astro";
import { sc } from "../utils/sc";
import { selectionMode } from "../stores/selectionMode";
import { fileStore, setStagedFiles } from "../stores/files";
---
```

### ✅ Después (Imports organizados)

```astro
---
// features/file-management/components/LibraryFileSelector.astro
import Switch from "@/shared/components/ui/Switch.astro";
import { sc } from "@/shared/utils/sc";
import { selectionMode } from "../stores/selectionMode";
import { fileStore, setStagedFiles } from "../stores/files";
---
```

**Beneficios**:
- ✅ Clara separación shared vs feature
- ✅ Imports relativos cortos para mismo feature
- ✅ Fácil identificar dependencias

---

## 8. Layout con Sidebar

### ❌ Antes

```astro
---
// layouts/DashboardLayout.astro
import Sidebar from "../components/Sidebar/Sidebar.astro";
---

<div class="flex">
  <Sidebar />
  <slot />
</div>
```

### ✅ Después

```astro
---
// layouts/DashboardLayout.astro
import Sidebar from "@/shared/components/layout/Sidebar.astro";
---

<div class="flex overflow-y-auto overflow-x-hidden">
  <Sidebar />
  <div class="flex flex-col gap-6 w-3xl mx-auto pt-10 h-screen">
    <slot />
  </div>
</div>
```

**Beneficios**:
- ✅ Path alias claro
- ✅ Sidebar en shared/layout (reutilizable)
- ✅ Layout se enfoca en estructura

---

## 9. Feature Completo (File Management)

### ✅ Estructura Completa

```
features/file-management/
├── components/
│   ├── FileUploader.astro
│   ├── FileLibrary.astro
│   ├── LibraryFileSelector.astro
│   └── LoadedFileSelector.astro
├── stores/
│   ├── files.ts
│   └── selectionMode.ts
└── types/
    └── file.types.ts
```

### Uso desde una página:

```astro
---
// pages/dashboard/files.astro
import Layout from '@/layouts/Layout.astro';
import DashboardLayout from '@/layouts/DashboardLayout.astro';
import FileUploader from '@/features/file-management/components/FileUploader.astro';
import FileLibrary from '@/features/file-management/components/FileLibrary.astro';
---

<Layout title="Archivos">
  <DashboardLayout>
    <FileUploader />
    <FileLibrary />
  </DashboardLayout>
</Layout>
```

**Beneficios**:
- ✅ Todo el feature en un solo lugar
- ✅ Fácil de encontrar código relacionado
- ✅ Separación clara de responsabilidades

---

## 10. Comunicación entre Features

### ✅ Patrón Recomendado

```typescript
// features/mindmap-generator/components/GeneratorForm.astro
<script>
  import { fileStore } from '@/features/file-management/stores/files';
  import { appendToCurrentMindmap } from '@/features/mindmap-editor/stores/currentMindmap';
  
  const generateMindmap = async () => {
    const selectedFile = fileStore.get().stagedIndexes[0];
    
    // Llamada al API
    const stream = await fetch(`/api/mindmaps/stream/${id}`, {
      method: 'POST',
      body: JSON.stringify({ fileId: selectedFile })
    });
    
    // Actualiza el mindmap
    for await (const chunk of stream) {
      appendToCurrentMindmap(chunk);
    }
  };
</script>
```

**Beneficios**:
- ✅ Features se comunican vía stores
- ✅ Acoplamiento bajo
- ✅ Testeable

---

## Resumen de Cambios Clave

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Imports** | Rutas relativas largas | Path aliases claros |
| **Organización** | Flat por tipo | Agrupado por feature |
| **Stores** | `/stores/all.ts` | `feature/stores/specific.ts` |
| **Componentes** | `/components/all` | `feature/components/` + `shared/` |
| **Tipos** | Inline en archivos | `feature/types/` + `shared/types/` |
| **Reutilización** | Copy-paste | Shared claramente definido |
| **Dependencias** | Confusas | Unidireccionales claras |
| **Búsqueda** | Buscar en todo | Saber exactamente dónde |

---

## 🎯 Tips Finales

1. **Migra gradualmente**: No necesitas migrar todo de una vez
2. **Empieza con shared**: Mueve utilidades y componentes UI primero
3. **Feature por feature**: Migra un feature completo antes de pasar al siguiente
4. **Actualiza imports**: Usa find & replace con cuidado
5. **Prueba constantemente**: `npm run build` después de cada cambio importante

---

*Con nano-precisión, Carlos - El Nano-Arquitecto* 🏗️