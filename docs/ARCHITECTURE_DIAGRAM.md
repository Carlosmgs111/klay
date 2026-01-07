# Diagrama de Arquitectura Frontend

## Estructura de Dependencias

```mermaid
graph TD
    %% Nodes
    P[Pages<br/>Orquestadores]
    L[Layouts<br/>Plantillas]
    
    F1[Feature: Mindmap Editor<br/>- MarkmapViewer<br/>- MindmapTextEditor<br/>- currentMindmap store]
    F2[Feature: File Management<br/>- FileUploader<br/>- FileLibrary<br/>- files store]
    F3[Feature: Mindmap Generator<br/>- FlowStep<br/>- GeneratorForm]
    
    S1[Shared UI<br/>- Button<br/>- Switch<br/>- Card]
    S2[Shared Layout<br/>- Sidebar<br/>- Header]
    S3[Shared Utils<br/>- sc<br/>- shuffleArray]
    S4[Shared Stores<br/>- theme<br/>- auth]
    
    B[Backend<br/>Clean Architecture]
    
    %% Connections
    P --> L
    P --> F1
    P --> F2
    P --> F3
    
    L --> S1
    L --> S2
    
    F1 --> S1
    F1 --> S3
    F2 --> S1
    F2 --> S3
    F3 --> S1
    F3 --> S3
    
    F1 -.-> F2
    F3 -.-> F2
    
    P --> B
    F1 --> B
    F2 --> B
    F3 --> B
    
    %% Styling
    classDef pageStyle fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef featureStyle fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef sharedStyle fill:#10b981,stroke:#059669,color:#fff
    classDef backendStyle fill:#f59e0b,stroke:#d97706,color:#fff
    
    class P,L pageStyle
    class F1,F2,F3 featureStyle
    class S1,S2,S3,S4 sharedStyle
    class B backendStyle
```

## Flujo de Información

```mermaid
sequenceDiagram
    participant User
    participant Page
    participant Feature
    participant Shared
    participant Backend
    
    User->>Page: Interacción
    Page->>Feature: Renderiza componentes
    Feature->>Shared: Usa componentes UI
    Feature->>Backend: API call
    Backend-->>Feature: Respuesta
    Feature->>Feature: Actualiza store
    Feature-->>Page: Re-render
    Page-->>User: UI actualizado
```

## Organización de Features

```mermaid
graph LR
    subgraph "Feature: Mindmap Editor"
        ME1[components/]
        ME2[lib/]
        ME3[stores/]
        ME4[types/]
    end
    
    subgraph "Feature: File Management"
        FM1[components/]
        FM2[stores/]
        FM3[types/]
    end
    
    subgraph "Shared"
        SH1[components/ui/]
        SH2[components/layout/]
        SH3[utils/]
        SH4[types/]
    end
    
    ME1 --> SH1
    ME1 --> SH3
    FM1 --> SH1
    FM1 --> SH3
    
    style ME1 fill:#8b5cf6
    style ME2 fill:#8b5cf6
    style ME3 fill:#8b5cf6
    style ME4 fill:#8b5cf6
    style FM1 fill:#8b5cf6
    style FM2 fill:#8b5cf6
    style FM3 fill:#8b5cf6
    style SH1 fill:#10b981
    style SH2 fill:#10b981
    style SH3 fill:#10b981
    style SH4 fill:#10b981
```

## Reglas de Importación

```mermaid
graph TD
    A[Pages] -->|✅ Puede importar| B[Features]
    A -->|✅ Puede importar| C[Shared]
    A -->|✅ Puede importar| D[Layouts]
    
    B -->|✅ Puede importar| C
    B -->|⚠️ Con precaución| B
    
    C -->|❌ NO puede importar| B
    
    D -->|✅ Puede importar| C
    
    style A fill:#3b82f6
    style B fill:#8b5cf6
    style C fill:#10b981
    style D fill:#06b6d4
```

## Comparación: Antes vs Después

### Antes (Estructura Plana)
```
src/
├── components/      ← TODO mezclado
├── stores/          ← Estado global no organizado
├── utils/           ← Utilidades sin categorizar
└── pages/
```

### Después (Arquitectura por Capas)
```
src/
├── features/        ← Agrupado por capacidad
│   ├── mindmap-editor/
│   ├── file-management/
│   └── mindmap-generator/
├── shared/          ← Solo código reutilizable
│   ├── components/
│   ├── stores/
│   └── utils/
└── pages/           ← Orquestadores ligeros
```

## Beneficios Visuales

```mermaid
mindmap
  root((Nueva<br/>Arquitectura))
    Escalabilidad
      Añadir features sin conflictos
      Crecimiento modular
    Mantenibilidad
      Código fácil de encontrar
      Estructura autodocumentada
    Testabilidad
      Features aisladas
      Mocks más simples
    Colaboración
      Menos conflictos en Git
      Onboarding más rápido
```

## Ejemplo de Feature Completo

```mermaid
graph TB
    subgraph "Feature: Mindmap Editor"
        direction TB
        C1[MarkmapViewer.astro]
        C2[MindmapTextEditor.astro]
        
        L1[MarkmapViewer.ts]
        L2[colors.neon.v1.json]
        
        S1[currentMindmap.ts]
        
        T1[mindmap.types.ts]
        
        C1 --> L1
        C1 --> S1
        C2 --> S1
        L1 --> L2
        C1 --> T1
        S1 --> T1
    end
    
    SU[Shared Utils]
    
    C1 --> SU
    C2 --> SU
    
    style C1 fill:#a78bfa
    style C2 fill:#a78bfa
    style L1 fill:#c084fc
    style L2 fill:#c084fc
    style S1 fill:#d8b4fe
    style T1 fill:#e9d5ff
    style SU fill:#86efac
```