# 🔄 Guía de Migración Frontend - Arquitectura por Capas

## 📖 Índice
1. [Visión General](#visión-general)
2. [Estructura de Directorios](#estructura-de-directorios)
3. [Reglas de Importación](#reglas-de-importación)
4. [Path Aliases](#path-aliases)
5. [Checklist de Migración](#checklist-de-migración)
6. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🎯 Visión General

### Principios Fundamentales

1. **Features autocontenidos**: Cada feature agrupa componentes, stores, tipos y lógica relacionada
2. **Shared para código reutilizable**: Solo lo verdaderamente compartido entre múltiples features
3. **Pages como orquestadores**: Las páginas solo ensamblan features y layouts
4. **Dependencias unidireccionales**: `pages → features → shared`

### Motivación

- ✅ **Escalabilidad**: Añade features sin tocar código existente
- ✅ **Predecible**: Dependencias claras y unidireccionales
- ✅ **Mantenible**: Encontrar código es intuitivo
- ✅ **Testeable**: Features aisladas son más fáciles de testear

---

## 📁 Estructura de Directorios

```
src/
├── pages/                    # Rutas de Astro (sin cambios)
│   ├── index.astro
│   ├── editor.astro
│   ├── dashboard/
│   └── api/
│
├── features/                 # Módulos por capacidad
│   ├── mindmap-editor/
│   │   ├── components/      # Componentes específicos del feature
│   │   ├── lib/            # Lógica de negocio y utilidades
│   │   ├── stores/         # Estado específico del feature
│   │   └── types/          # Tipos TypeScript del feature
│   ├── file-management/
│   └── mindmap-generator/
│
├── shared/                   # Código compartido
│   ├── components/
│   │   ├── ui/             # Componentes UI genéricos (Button, Switch)
│   │   └── layout/         # Componentes de layout (Sidebar, Header)
│   ├── stores/             # Stores globales (auth, theme)
│   ├── utils/              # Utilidades puras
│   └── types/              # Tipos compartidos
│
├── layouts/                  # Layouts de Astro
├── styles/                   # Estilos globales
├── assets/                   # Assets estáticos
└── backend/                  # Backend (sin cambios)
```

---

## 🔗 Reglas de Importación

### ✅ Permitidas

```typescript
// Pages puede importar de todo
// pages/dashboard/generator.astro
import DashboardLayout from '@/layouts/DashboardLayout.astro';
import FlowStep from '@/features/mindmap-generator/components/FlowStep.astro';
import Button from '@/shared/components/ui/Button.astro';

// Features puede usar shared
// features/mindmap-editor/components/MarkmapViewer.astro
import { sc } from '@/shared/utils/sc';
import { currentMindmap } from '../stores/currentMindmap';

// Features pueden importar otros features (con precaución)
// features/mindmap-generator/components/GeneratorForm.astro
import { fileStore } from '@/features/file-management/stores/files';
```

### ❌ Prohibidas

```typescript
// Shared NO puede importar de features
// ❌ shared/components/ui/Button.astro
import { currentMindmap } from '@/features/mindmap-editor/stores/currentMindmap';

// Evita dependencias circulares entre features
// ❌ features/file-management/stores/files.ts
import { currentMindmap } from '@/features/mindmap-editor/stores/currentMindmap';
// que a su vez importa de file-management
```

---

## 🗺️ Path Aliases

Configura en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/layouts/*": ["src/layouts/*"]
    }
  }
}
```

### Ejemplos de Uso

```typescript
// Antes
import { sc } from "../../utils/sc";
import Switch from "../../components/Switch.astro";
import { currentMindmap } from "../../stores/currentMindmap";

// Después
import { sc } from "@/shared/utils/sc";
import Switch from "@/shared/components/ui/Switch.astro";
import { currentMindmap } from "@/features/mindmap-editor/stores/currentMindmap";
```

---

## ✅ Checklist de Migración

### Fase 1: Preparación
- ✅ Crear estructura de directorios `features/` y `shared/`
- ✅ Configurar path aliases en `tsconfig.json`
- [ ] Documentar la nueva estructura al equipo

### Fase 2: Migrar Shared
- ✅ Mover utilidades a `shared/utils/`
  - ✅ `sc.ts`
  - ✅ `shuffleArray.ts`
- [ ] Mover componentes UI a `shared/components/ui/`
  - ✅ `Switch.astro`
  - [ ] `Button.astro` (si existe)
- ✅ Mover componentes de layout a `shared/components/layout/`
  - ✅ `Sidebar.astro`
  - ✅ `SidebarItem.astro`

### Fase 3: Migrar Features
- ✅ **Feature: Mindmap Editor**
  - ✅ Crear `features/mindmap-editor/stores/currentMindmap.ts`
  - ✅ Crear `features/mindmap-editor/types/mindmap.types.ts`
  - ✅ Mover `components/MarkmapView/` a `features/mindmap-editor/components/`
  - ✅ Mover `components/MindmapTextEditor/` a `features/mindmap-editor/components/`
  - ✅ Mover `lib/MarkmapViewer.ts` a `features/mindmap-editor/lib/`
  
- ✅ **Feature: File Management**
  - ✅ Crear `features/file-management/stores/files.ts`
  - ✅ Crear `features/file-management/stores/selectionMode.ts`
  - ✅ Crear `features/file-management/types/file.types.ts`
  - ✅ Mover `components/LoadedFileSelector.astro`
  - ✅ Mover `components/LibraryFileSelector.astro`
  
- ✅ **Feature: Mindmap Generator**
  - ✅ Mover `components/FlowStep.astro`
  - ✅ Crear stores si es necesario

### Fase 4: Actualizar Importaciones
- ✅ Actualizar imports en `pages/`
- [ ] Actualizar imports en `layouts/`
- [ ] Actualizar imports dentro de features
- [ ] Verificar que no hay imports circulares

### Fase 5: Testing
- [ ] Compilar proyecto: `npm run build`
- [ ] Verificar que todas las páginas cargan
- [ ] Probar funcionalidad de cada feature
- [ ] Verificar hot reload en desarrollo

### Fase 6: Limpieza
- [ ] Eliminar carpetas antiguas (`components/`, `stores/`, `utils/`)
- [ ] Actualizar documentación del proyecto
- [ ] Actualizar README con nueva estructura

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Componente de Feature

```astro
---
// features/mindmap-editor/components/MarkmapViewer.astro
import { MarkMapViewer } from '../lib/MarkmapViewer';

interface Props {
  className?: string;
}

const { className = "" } = Astro.props;
---

<div class={`markmap-container ${className}`}>
  <svg data-type="markmap" class="markmap-svg w-full h-full"></svg>
  
  <div class="absolute bottom-4 right-4 flex flex-col gap-2">
    <button class="zoom-in">Zoom In</button>
    <button class="zoom-out">Zoom Out</button>
  </div>
</div>

<script>
  import { MarkMapViewer } from '../lib/MarkmapViewer';
  
  document.addEventListener("astro:page-load", () => {
    const container = document.querySelector('.markmap-container');
    if (container) {
      new MarkMapViewer(container as HTMLElement);
    }
  });
</script>
```

### Ejemplo 2: Store de Feature

```typescript
// features/file-management/stores/files.ts
import { atom } from "nanostores";
import type { FileIndex } from "../types/file.types";

export const fileStore = atom<FileIndex>({
  indexes: [],
  stagedIndexes: [],
  files: {},
});

export const setFiles = (files: Record<string, any>) => {
  const prevState = fileStore.get();
  fileStore.set({
    ...prevState,
    files: { ...prevState.files, ...files },
    indexes: [...prevState.indexes, ...Object.keys(files)]
  });
};
```

### Ejemplo 3: Página Orquestadora

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
```

### Ejemplo 4: Componente Shared

```astro
---
// shared/components/ui/Button.astro
import { sc } from '@/shared/utils/sc';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  class?: string;
}

const { variant = 'primary', size = 'md', class: className } = Astro.props;

const variantClasses = {
  primary: 'bg-cyan-500 hover:bg-cyan-600 text-neutral-950',
  secondary: 'bg-neutral-800 hover:bg-neutral-700 text-cyan-400',
  ghost: 'bg-transparent hover:bg-neutral-800 text-cyan-400'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};
---

<button 
  class={sc(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
    variantClasses[variant],
    sizeClasses[size],
    className
  )}
  {...Astro.props}
>
  <slot />
</button>
```

---

## 🚀 Beneficios Post-Migración

1. **Desarrollo más rápido**: Sabes exactamente dónde buscar y añadir código
2. **Onboarding facilitado**: Nueva estructura es autodocumentada
3. **Testing granular**: Puedes testear features de manera aislada
4. **Code splitting natural**: Los features pueden lazy-loaderse fácilmente
5. **Refactoring seguro**: Cambios en un feature no afectan otros

---

## 📚 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Astro Components Guide](https://docs.astro.build/en/core-concepts/astro-components/)

---

## 🤝 Contribución

Si encuentras formas de mejorar esta arquitectura, documéntalas aquí para el equipo.