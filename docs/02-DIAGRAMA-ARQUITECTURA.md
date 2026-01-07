# Diagrama de Arquitectura del Sistema - MindMapAI

## 📐 Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "CLIENTE / USUARIO"
        U[Usuario]
        B[Navegador Web]
    end

    subgraph "FRONTEND LAYER - Astro SSR + React"
        LP[Landing Page<br/>index.astro]
        KP[Knowledge Pages<br/>generator, assets, files]
        UP[Use Cases Pages<br/>chat, mindmaps, generator]
        PG[Playground Pages<br/>chunker tester]

        subgraph "FEATURES (Autocontenidos)"
            FM[File Management<br/>FileList, FileUploader]
            MM[Mindmap Management<br/>Editor, Viewer, Generator]
            KM[Knowledge Management<br/>Dashboard, FlowSteps]
            CH[Chat<br/>ChatManager, Messages]
        end

        subgraph "SHARED LAYER"
            SC[Components<br/>Switch, Spinner, Sidebar]
            ST[Stores (Nanostores)<br/>fileStore, chatStore, mindmapStore]
            UT[Utils<br/>sc, shuffleArray]
        end

        subgraph "LAYOUTS"
            LY[Layout.astro]
            DL[DashboardLayout.astro]
        end
    end

    subgraph "API ROUTES LAYER - Astro Server"
        AR1[/api/file]
        AR2[/api/texts]
        AR3[/api/chunking]
        AR4[/api/embeddings]
        AR5[/api/mindmaps]
        AR6[/api/chat]
        AR7[/api/query]
        AR8[/api/knowledge]
    end

    subgraph "BACKEND LAYER - Clean Architecture"
        subgraph "Domain Modules"
            FI[FILES Module<br/>Upload, Download, Delete]
            TE[TEXT-EXTRACTION Module<br/>PDF→Text, Cleaning]
            CK[CHUNKING Module<br/>6 Estrategias de chunking]
            EM[EMBEDDINGS Module<br/>Vector generation & search]
            AG[AGENTS/AI Module<br/>LLM Integration]
            MD[MINDMAPS Module<br/>Markdown generation]
            KA[KNOWLEDGE-ASSETS Module<br/>Pipeline orchestration]
            QO[QUERY-ORCHESTRATOR Module<br/>RAG Pipeline]
        end

        subgraph "Shared Backend"
            SH[Shared<br/>Config, Contracts, DTOs]
        end
    end

    subgraph "INFRASTRUCTURE LAYER"
        subgraph "Storage Providers"
            LFS[LocalFsStorage<br/>Server filesystem]
            BRS[BrowserStorage<br/>File System Access API]
        end

        subgraph "Repositories"
            LR[LocalCsvRepository<br/>CSV metadata]
            LLR[LocalLevelRepository<br/>LevelDB vectors]
            BIR[BrowserRepository<br/>IndexedDB]
        end

        subgraph "AI Providers"
            HF[HuggingFace Provider<br/>Embeddings + LLMs]
            CO[Cohere Provider<br/>Embeddings]
            BR[Browser Provider<br/>@xenova/transformers]
            AI[AI SDK Provider<br/>DeepSeek-V3]
        end

        subgraph "Extractors"
            PE[PDF Extractor<br/>pdfjs-dist]
            TC[Text Cleaner<br/>Preprocessing]
        end
    end

    subgraph "DATA STORAGE LAYER"
        FS[(Local Filesystem<br/>PDFs, Files)]
        LDB[(LevelDB<br/>Key-Value Store)]
        IDB[(IndexedDB<br/>Browser Storage)]
        CSV[(CSV Files<br/>Metadata Repository)]
    end

    subgraph "EXTERNAL SERVICES"
        HFA[HuggingFace API<br/>Inference Endpoints]
        COA[Cohere API<br/>Embeddings]
    end

    %% User flow
    U -->|Interacts| B
    B -->|HTTP Requests| LP
    B -->|HTTP Requests| KP
    B -->|HTTP Requests| UP
    B -->|HTTP Requests| PG

    %% Frontend connections
    LP --> LY
    KP --> DL
    UP --> DL
    PG --> DL

    KP --> FM
    KP --> KM
    UP --> MM
    UP --> CH

    FM --> SC
    MM --> SC
    KM --> SC
    CH --> SC

    FM --> ST
    MM --> ST
    CH --> ST

    SC --> UT

    %% API Routes connections
    FM -->|API Calls| AR1
    MM -->|API Calls| AR5
    KM -->|API Calls| AR8
    CH -->|API Calls| AR6
    KM -->|API Calls| AR2
    KM -->|API Calls| AR3
    KM -->|API Calls| AR4

    %% Backend routing
    AR1 --> FI
    AR2 --> TE
    AR3 --> CK
    AR4 --> EM
    AR5 --> MD
    AR6 --> AG
    AR7 --> QO
    AR8 --> KA

    %% Backend dependencies
    FI --> SH
    TE --> SH
    CK --> SH
    EM --> SH
    AG --> SH
    MD --> SH
    KA --> FI
    KA --> TE
    KA --> CK
    KA --> EM
    MD --> FI
    MD --> TE
    MD --> AG
    QO --> EM
    QO --> AG

    %% Infrastructure connections - Storage
    FI --> LFS
    FI --> BRS

    %% Infrastructure connections - Repositories
    FI --> LR
    FI --> BIR
    TE --> BIR
    CK --> BIR
    EM --> LLR
    EM --> BIR

    %% Infrastructure connections - AI Providers
    EM --> HF
    EM --> CO
    EM --> BR
    AG --> AI
    AG --> HF

    %% Infrastructure connections - Extractors
    TE --> PE
    TE --> TC

    %% Data storage connections
    LFS --> FS
    BRS --> IDB
    LR --> CSV
    LLR --> LDB
    BIR --> IDB

    %% External services
    HF --> HFA
    CO --> COA

    %% Styling
    classDef frontend fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef backend fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef infra fill:#10b981,stroke:#047857,color:#fff
    classDef storage fill:#f59e0b,stroke:#d97706,color:#fff
    classDef external fill:#ef4444,stroke:#b91c1c,color:#fff

    class LP,KP,UP,PG,FM,MM,KM,CH,SC,ST,UT,LY,DL frontend
    class FI,TE,CK,EM,AG,MD,KA,QO,SH backend
    class LFS,BRS,LR,LLR,BIR,HF,CO,BR,AI,PE,TC infra
    class FS,LDB,IDB,CSV storage
    class HFA,COA external
```

---

## 🏗️ Arquitectura en Capas Detallada

### 1. **CLIENTE / USUARIO**
- **Usuario**: Interactúa con la aplicación a través del navegador
- **Navegador Web**: Renderiza la interfaz y ejecuta código JavaScript

---

### 2. **FRONTEND LAYER**

#### 2.1 Páginas (Astro SSR)
- **Landing Page** (`index.astro`): Página principal con marketing
- **Knowledge Pages**: Gestión de conocimiento (generator, assets, files, texts, chunks, embeddings)
- **Use Cases Pages**: Casos de uso (chat, mindmaps, generator)
- **Playground Pages**: Herramientas de prueba (chunker tester)

#### 2.2 Features (Autocontenidos)
Cada feature es autocontenido con sus propios componentes, stores y lógica:

- **File Management**: Gestión de archivos (carga, lista, selección)
  - Componentes: `FileList`, `FileItem`, `FileUploader`, `LibraryFileSelector`
  - Store: `fileStore`

- **Mindmap Management**: Gestión de mapas mentales
  - Componentes: `MindmapTextEditor`, `MarkmapView`, `MarkMapViewer`
  - Store: `currentMindmap`, `queryStore`

- **Knowledge Management**: Dashboard de procesamiento
  - Componentes: `KnowledgeManagement`, `FlowStep`

- **Chat**: Interfaz de chat con IA
  - Componentes: `Chat`, `ChatManager`
  - Store: `chatStore`

#### 2.3 Shared Layer
Código compartido entre features:

- **Components**: Componentes UI reutilizables (`Switch`, `Spinner`, `Sidebar`)
- **Stores**: Estado global con Nanostores (`fileStore`, `chatStore`, `mindmapStore`)
- **Utils**: Utilidades (`sc` para clsx, `shuffleArray`)

#### 2.4 Layouts
- **Layout.astro**: Layout base con estructura HTML
- **DashboardLayout.astro**: Layout con sidebar para dashboards

---

### 3. **API ROUTES LAYER**

Rutas de API Astro (SSR) que exponen endpoints HTTP:

- `/api/file` - CRUD de archivos
- `/api/texts` - Gestión de textos extraídos
- `/api/chunking` - Servicio de chunking
- `/api/embeddings` - Generación y búsqueda de embeddings
- `/api/mindmaps` - Generación de mindmaps
- `/api/chat` - Chat streaming con LLM
- `/api/query` - RAG pipeline completo
- `/api/knowledge` - Orquestación de pipeline de conocimiento

---

### 4. **BACKEND LAYER (Clean Architecture)**

Módulos backend organizados con Clean Architecture:

#### 4.1 Domain Modules

**FILES Module**
- **Responsabilidad**: Gestión de archivos (upload, download, delete, list)
- **Use Cases**: `uploadFile()`, `getFile()`, `deleteFile()`, `listFiles()`
- **Contracts**: `FileStorage`, `FileRepository`

**TEXT-EXTRACTION Module**
- **Responsabilidad**: Extraer texto de PDFs y limpiar
- **Use Cases**: `extractTextFromPDF()`, `getAllTexts()`, `removeText()`
- **Contracts**: `TextExtractor`, `TextRepository`

**CHUNKING Module**
- **Responsabilidad**: Particionar texto en chunks
- **Estrategias**: Fixed-size, Sentence, Paragraph, Recursive, Semantic
- **Use Cases**: `chunkText()`, `getChunksByStrategy()`
- **Contracts**: `Chunker`, `ChunkRepository`

**EMBEDDINGS Module**
- **Responsabilidad**: Generar embeddings vectoriales y búsqueda semántica
- **Use Cases**: `generateEmbeddings()`, `search()`, `getAllDocuments()`
- **Contracts**: `EmbeddingProvider`, `VectorRepository`

**AGENTS/AI Module**
- **Responsabilidad**: Integración con LLMs
- **Use Cases**: `streamCompletion()`, `generateCompletion()`
- **Contracts**: `AIProvider`

**MINDMAPS Module**
- **Responsabilidad**: Generar mindmaps con IA
- **Use Cases**: `uploadFileAndGenerateMindmap()`, `generateMindmapFromFileStream()`
- **Dependencias**: `FilesApi`, `TextExtractorApi`, `AIApi`

**KNOWLEDGE-ASSETS Module**
- **Responsabilidad**: Orquestar pipeline completo de conocimiento
- **Use Cases**: `generateNewKnowledge()`
- **Pipeline**: Upload → Extract → Chunk → Embed
- **Dependencias**: Todos los módulos anteriores

**QUERY-ORCHESTRATOR Module**
- **Responsabilidad**: Implementar RAG (Retrieval Augmented Generation)
- **Use Cases**: `queryWithContext()`
- **Pipeline**: Query embedding → Vector search → LLM generation
- **Dependencias**: `EmbeddingAPI`, `AIApi`

#### 4.2 Shared Backend
- **Config**: Configuración centralizada
- **Contracts**: Interfaces y tipos compartidos
- **DTOs**: Data Transfer Objects

---

### 5. **INFRASTRUCTURE LAYER**

Implementaciones concretas de contratos:

#### 5.1 Storage Providers
- **LocalFsStorage**: Almacenamiento en filesystem del servidor (Node.js)
- **BrowserStorage**: Almacenamiento usando File System Access API (Browser)

#### 5.2 Repositories
- **LocalCsvRepository**: Repositorio CSV para metadatos (servidor)
- **LocalLevelRepository**: Repositorio LevelDB para vectores (servidor)
- **BrowserRepository**: Repositorio IndexedDB (browser)

#### 5.3 AI Providers
- **HuggingFace Provider**: Embeddings y LLMs via HuggingFace
- **Cohere Provider**: Embeddings via Cohere API
- **Browser Provider**: Embeddings con @xenova/transformers (browser)
- **AI SDK Provider**: LLMs con AI SDK (DeepSeek-V3)

#### 5.4 Extractors
- **PDF Extractor**: Extracción de texto con pdfjs-dist
- **Text Cleaner**: Limpieza y preprocesamiento

---

### 6. **DATA STORAGE LAYER**

Almacenamiento persistente:

- **Local Filesystem**: Archivos PDF y binarios (servidor)
- **LevelDB**: Base de datos key-value para vectores (servidor)
- **IndexedDB**: Base de datos browser para metadatos y vectores
- **CSV Files**: Archivos CSV para repositorio de metadatos

---

### 7. **EXTERNAL SERVICES**

Servicios externos:

- **HuggingFace API**: Inference endpoints para embeddings y LLMs
- **Cohere API**: Servicio de embeddings

---

## 🔄 Flujo de Datos Principal

### Flujo 1: Generación de Conocimiento

```
Usuario → Frontend (Knowledge Management)
  ↓
Upload PDF → /api/file → FILES Module
  ↓ Storage (LFS/Browser)
  ↓
Extract Text → /api/texts → TEXT-EXTRACTION Module
  ↓ PDF Extractor
  ↓
Chunk Text → /api/chunking → CHUNKING Module
  ↓ ChunkerFactory (Fixed-size)
  ↓
Generate Embeddings → /api/embeddings → EMBEDDINGS Module
  ↓ EmbeddingProvider (Cohere/HF/Browser)
  ↓ VectorRepository (Level/IndexedDB)
  ↓
Knowledge Asset Created → Stored in repositories
```

### Flujo 2: Generación de Mindmap

```
Usuario → Frontend (Mindmap Management)
  ↓
Select File + Query → /api/mindmaps → MINDMAPS Module
  ↓
Get File → FILES Module
  ↓
Extract Text → TEXT-EXTRACTION Module
  ↓
Generate Mindmap → AGENTS/AI Module (DeepSeek-V3)
  ↓ Streaming response
  ↓
Render Markdown → MarkmapView (Frontend)
  ↓
Interactive Visualization
```

### Flujo 3: Chat con RAG

```
Usuario → Frontend (Chat)
  ↓
Query → /api/query → QUERY-ORCHESTRATOR Module
  ↓
Embed Query → EMBEDDINGS Module
  ↓
Search Similar → VectorRepository (cosine similarity)
  ↓
Get Context → Top K chunks
  ↓
Generate Response → AGENTS/AI Module (con contexto)
  ↓ Streaming
  ↓
Display Response → Chat UI
```

---

## 🎯 Principios Arquitectónicos

### 1. **Clean Architecture**
- Separación de capas (Domain, Application, Infrastructure)
- Dependency Inversion (contratos vs implementaciones)
- Testabilidad y mantenibilidad

### 2. **Feature-Sliced Design**
- Features autocontenidos
- Shared layer para código reutilizable
- Evita dependencias circulares

### 3. **Separation of Concerns**
- Frontend solo UI y estado
- Backend solo lógica de negocio
- Infrastructure solo implementaciones técnicas

### 4. **Dependency Injection**
- Resolvers para inyectar dependencias
- Factories para crear instancias
- Políticas de infraestructura configurables

### 5. **Strategy Pattern**
- Múltiples estrategias de chunking
- Múltiples providers de IA
- Múltiples storage options

### 6. **Repository Pattern**
- Abstracción de persistencia
- Múltiples implementaciones (CSV, Level, IndexedDB)
- Independencia de tecnología de storage

---

## 📊 Tecnologías por Capa

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Astro 5, React 19, Tailwind CSS 4, Nanostores, CodeMirror 6, Markmap |
| **API Routes** | Astro SSR, Node.js, TypeScript |
| **Backend** | TypeScript, Clean Architecture patterns |
| **AI/ML** | HuggingFace SDK, Cohere SDK, AI SDK, @xenova/transformers, @mlc-ai/web-llm |
| **Storage** | LevelDB, IndexedDB, File System, CSV |
| **Build** | Vite, Astro compiler, TypeScript compiler |

---

## 🔐 Seguridad y Privacidad

1. **Privacy-First**: Todo puede ejecutarse localmente (browser o servidor privado)
2. **No vendor lock-in**: Múltiples providers de IA configurables
3. **Data isolation**: Datos almacenados localmente (no cloud obligatorio)
4. **Configurable**: Políticas de infraestructura seleccionables en runtime

---

## 🚀 Escalabilidad

1. **Horizontal**: Múltiples workers para procesamiento paralelo
2. **Vertical**: LevelDB y IndexedDB soportan millones de vectores
3. **Modular**: Fácil agregar nuevos providers, storages, chunkers
4. **Streaming**: Respuestas en tiempo real sin bloqueo
