# Diagramas de Arquitectura - MindmapAI Backend

Este documento contiene los diagramas completos de la arquitectura del backend de MindmapAI.

---

## 1. Diagrama de Estructura de Directorios y Módulos

```mermaid
graph TB
    subgraph Backend["src/backend/"]
        AI["AI Module"]
        Files["Files Module"]
        TextExtraction["TextExtraction Module"]
        Mindmaps["Mindmaps Module"]
        Shared["Shared"]
    end

    subgraph AI["AI Module"]
        AI_Contracts["@core-contracts/
        - aiApi.ts
        - dtos.ts
        - providers.ts
        - services.ts"]
        AI_App["application/
        - UsesCases.ts"]
        AI_Infra["infrastructure/
        - AIProvider.ts"]
        AI_Index["index.ts"]
    end

    subgraph Files["Files Module"]
        Files_Contracts["@core-contracts/
        - filesApi.ts
        - dtos.ts
        - repository.ts
        - storage.ts"]
        Files_App["application/
        - UseCases.ts"]
        Files_Infra["infrastructure/
        - routes/AstroRouter.ts
        - storage/LocalFsStorage.ts
        - repository/LocalCsvRepository.ts"]
        Files_Index["index.ts"]
    end

    subgraph TextExtraction["TextExtraction Module"]
        Text_Contracts["@core-contracts/
        - textExtractorApi.ts
        - dtos.ts
        - repository.ts
        - services.ts"]
        Text_App["application/
        - UseCases.ts"]
        Text_Domain["Domain/
        - Text.ts"]
        Text_Infra["infrastructure/
        - routes/AstroRouter.ts
        - extraction/PDFTextExtractor.ts
        - repository/LocalLevelRepository.ts"]
        Text_Index["index.ts"]
    end

    subgraph Mindmaps["Mindmaps Module"]
        MM_Contracts["@core-contracts/
        - mindmapsApi.ts
        - dtos.ts"]
        MM_App["application/
        - UseCases.ts"]
        MM_Infra["infrastructure/
        - routes/AstroRouter.ts"]
        MM_Index["index.ts"]
    end

    subgraph Shared["Shared"]
        Shared_Contracts["@core-contracts/
        - stream.ts"]
        Shared_Config["config/
        - repositories.ts"]
    end

    style Backend fill:#f9f9f9,stroke:#333,stroke-width:2px
    style AI fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Files fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style TextExtraction fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Mindmaps fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Shared fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

---

## 2. Diagrama de Arquitectura Hexagonal (Clean Architecture)

```mermaid
graph TB
    subgraph External["Capa Externa - Infraestructura"]
        HTTP["HTTP Layer
        Astro API Routes
        /api/file/*
        /api/mindmaps/*
        /api/texts/*"]

        Storage["Storage Adapters
        - LocalFsStorage
        - CloudinaryStorage ❌"]

        Repository["Repository Adapters
        - LocalCsvRepository
        - LocalLevelRepository"]

        AIProvider["AI Providers
        - AISDKProvider
        - Hugging Face API"]

        Extractor["Text Extractors
        - PDFTextExtractor"]
    end

    subgraph Application["Capa de Aplicación - Use Cases"]
        FilesUC["FilesUseCases
        - uploadFile()
        - getFiles()
        - getFileById()
        - deleteFile()"]

        TextUC["TextExtraction UseCases
        - extractTextFromPDF()
        - removeText()
        - getOneText()
        - getAllTexts()"]

        AIUC["AIUseCases
        - streamCompletion()"]

        MindmapsUC["Mindmaps UseCases
        - uploadFileAndGenerateMindmap()
        - selectFileAndGenerateMindmap()
        - generateMindmapFromFileStream()"]
    end

    subgraph Core["Núcleo - Contratos y Dominio"]
        Interfaces["Interfaces (Puertos)
        - FilesApi
        - TextExtractorApi
        - AIApi
        - MindmapsApi
        - Storage
        - Repository
        - AIProvider
        - TextExtractor"]

        DTOs["DTOs
        - FileDTO
        - TextDTO
        - AICompletionDTO
        - GenerateMindmapParams"]

        Domain["Entidades de Dominio
        - Text"]
    end

    subgraph External2["Servicios Externos"]
        HF["Hugging Face
        DeepSeek V3"]
        FS["File System
        ./uploads/
        ./database/"]
        DB["Databases
        - files.csv
        - LevelDB"]
    end

    HTTP -->|usa| FilesUC
    HTTP -->|usa| TextUC
    HTTP -->|usa| MindmapsUC

    FilesUC -->|implementa| Interfaces
    TextUC -->|implementa| Interfaces
    AIUC -->|implementa| Interfaces
    MindmapsUC -->|implementa| Interfaces

    FilesUC -->|usa| Storage
    FilesUC -->|usa| Repository
    TextUC -->|usa| Extractor
    TextUC -->|usa| Repository
    AIUC -->|usa| AIProvider
    MindmapsUC -->|orquesta| FilesUC
    MindmapsUC -->|orquesta| TextUC
    MindmapsUC -->|orquesta| AIUC

    Storage -.->|implementa| Interfaces
    Repository -.->|implementa| Interfaces
    AIProvider -.->|implementa| Interfaces
    Extractor -.->|implementa| Interfaces

    Storage --> FS
    Repository --> DB
    AIProvider --> HF

    Interfaces -->|define| DTOs
    Domain -->|usa| DTOs

    style Core fill:#4caf50,stroke:#2e7d32,stroke-width:3px,color:#fff
    style Application fill:#2196f3,stroke:#1565c0,stroke-width:3px,color:#fff
    style External fill:#ff9800,stroke:#e65100,stroke-width:2px
    style External2 fill:#9e9e9e,stroke:#424242,stroke-width:2px
```

---

## 3. Diagrama de Flujo de Datos Completo

```mermaid
sequenceDiagram
    participant Cliente
    participant API as Astro API Routes
    participant MMRouter as MindmapsRouter
    participant MMUC as Mindmaps UseCases
    participant FilesUC as Files UseCases
    participant TextUC as TextExtraction UseCases
    participant AIUC as AI UseCases
    participant Storage as LocalFsStorage
    participant CSVRepo as CSV Repository
    participant LevelDB as LevelDB Repository
    participant PDFExt as PDF Extractor
    participant HF as Hugging Face API

    Note over Cliente,HF: Flujo 1: Subida de Archivo
    Cliente->>+API: POST /api/file/[id] (multipart/form-data)
    API->>+FilesUC: uploadFile(FileUploadDTO)
    FilesUC->>+Storage: uploadFile(buffer, filename)
    Storage-->>-FilesUC: filepath
    FilesUC->>+CSVRepo: saveFile(FileDTO)
    CSVRepo-->>-FilesUC: success
    FilesUC-->>-API: filepath
    API-->>-Cliente: { filepath }

    Note over Cliente,HF: Flujo 2: Generación de Mindmap con Streaming
    Cliente->>+API: POST /api/mindmaps/stream/[id] (fileId)
    API->>+MMRouter: generateMindmapFromFileStream(id, fileId)
    MMRouter->>+MMUC: selectFileAndGenerateMindmapStream(id, fileId)

    MMUC->>+FilesUC: getFileById(fileId)
    FilesUC->>+CSVRepo: getFileById(fileId)
    CSVRepo-->>-FilesUC: FileDTO
    FilesUC->>+Storage: loadFileBuffer(filename)
    Storage-->>-FilesUC: Buffer
    FilesUC-->>-MMUC: FileDTO + Buffer

    MMUC->>+TextUC: extractTextFromPDF(params)
    TextUC->>+PDFExt: extractTextFromPDF(buffer)
    PDFExt-->>-TextUC: { text, metadata }
    TextUC->>+LevelDB: saveTextById(id, text, metadata)
    LevelDB-->>-TextUC: success
    TextUC-->>-MMUC: TextDTO

    MMUC->>MMUC: generatePrompt(text)
    MMUC->>+AIUC: streamCompletion(AICompletionDTO)
    AIUC->>+HF: POST /models/deepseek-ai/DeepSeek-V3

    loop Streaming chunks
        HF-->>AIUC: chunk
        AIUC-->>MMUC: yield chunk
        MMUC-->>MMRouter: yield chunk
        MMRouter-->>API: yield chunk
        API-->>Cliente: data: chunk\n\n
    end

    HF-->>-AIUC: stream complete
    AIUC-->>-MMUC: generator done
    MMUC-->>-MMRouter: generator done
    MMRouter-->>-API: stream done
    API-->>-Cliente: connection closed

    Note over Cliente,HF: Flujo 3: Eliminación de Archivo
    Cliente->>+API: DELETE /api/file/[id]
    API->>+FilesUC: deleteFile(id)
    FilesUC->>+CSVRepo: getFileById(id)
    CSVRepo-->>-FilesUC: FileDTO
    FilesUC->>+Storage: deleteFile(filename)
    Storage-->>-FilesUC: success
    FilesUC->>+CSVRepo: deleteFile(id)
    CSVRepo-->>-FilesUC: success
    FilesUC-->>-API: success
    API-->>-Cliente: 200 OK
```

---

## 4. Mapa de Dependencias entre Módulos

```mermaid
graph LR
    subgraph Frontend["Frontend Layer"]
        APIRoutes["API Routes
        src/pages/api/"]
    end

    subgraph Routers["Routers Layer"]
        FilesRouter["FilesRouter
        AstroRouter"]
        TextsRouter["TextsRouter
        AstroRouter"]
        MindmapsRouter["MindmapsRouter
        AstroRouter"]
    end

    subgraph UseCases["Use Cases Layer"]
        FilesAPI["FilesApi
        FilesUseCases"]
        TextAPI["TextExtractorApi
        UseCases"]
        AIAPI["AIApi
        AIUseCases"]
        MindmapsAPI["MindmapsApi
        UseCases"]
    end

    subgraph Adapters["Adapters Layer"]
        LocalFS["LocalFsStorage"]
        CSVRepo["LocalCsvRepository"]
        LevelRepo["LocalLevelRepository"]
        PDFExtractor["PDFTextExtractor"]
        AISDKProv["AISDKProvider"]
    end

    subgraph External["External Services"]
        FileSystem["File System
        ./uploads/
        ./database/"]
        CSV["files.csv"]
        Level["LevelDB
        ./database/level/texts"]
        HuggingFace["Hugging Face API
        DeepSeek V3"]
    end

    APIRoutes -->|usa| FilesRouter
    APIRoutes -->|usa| TextsRouter
    APIRoutes -->|usa| MindmapsRouter

    FilesRouter -->|usa| FilesAPI
    TextsRouter -->|usa| TextAPI
    MindmapsRouter -->|usa| MindmapsAPI

    FilesAPI -->|depende de| LocalFS
    FilesAPI -->|depende de| CSVRepo

    TextAPI -->|depende de| PDFExtractor
    TextAPI -->|depende de| LevelRepo

    AIAPI -->|depende de| AISDKProv

    MindmapsAPI -->|orquesta| FilesAPI
    MindmapsAPI -->|orquesta| TextAPI
    MindmapsAPI -->|orquesta| AIAPI

    LocalFS -->|escribe/lee| FileSystem
    CSVRepo -->|escribe/lee| CSV
    LevelRepo -->|escribe/lee| Level
    AISDKProv -->|HTTP requests| HuggingFace

    style Frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Routers fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style UseCases fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    style Adapters fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style External fill:#efebe9,stroke:#3e2723,stroke-width:2px

    style MindmapsAPI fill:#ffeb3b,stroke:#f57f17,stroke-width:3px
```

---

## 5. Diagrama de Dependencias de Paquetes (npm)

```mermaid
graph TB
    subgraph Core["Framework Core"]
        Astro["astro@5.16.3
        SSR enabled"]
        Node["Node.js Runtime"]
    end

    subgraph AI["AI & ML Stack"]
        AISDK["ai@5.0.112"]
        HFProvider["@ai-sdk/huggingface@0.0.12"]
        CohereProvider["@ai-sdk/cohere@2.0.21"]
    end

    subgraph Storage["Storage & Database"]
        Level["level@10.0.0
        LevelDB"]
        BSON["bson@7.0.0
        Serialization"]
    end

    subgraph FileProcessing["File Processing"]
        PDFExtract["pdf-extraction@1.0.2"]
        Multer["@types/multer@2.0.0"]
    end

    subgraph Visualization["Mindmap Visualization"]
        Markmap["markmap@0.6.1"]
        MarkmapCommon["markmap-common@0.18.9"]
        MarkmapLib["markmap-lib@0.18.12"]
        MarkmapToolbar["markmap-toolbar@0.18.12"]
        MarkmapView["markmap-view@0.18.12"]
    end

    subgraph Editor["Code Editor"]
        CodeMirror["codemirror@6.0.2"]
        CMSetup["@codemirror/basic-setup@0.20.0"]
        CMState["@codemirror/state@6.5.2"]
        CMView["@codemirror/view@6.39.4"]
    end

    subgraph Styling["Styling"]
        Tailwind["tailwindcss@4.1.17"]
        TailwindVite["@tailwindcss/vite@4.1.17"]
    end

    subgraph Utils["Utilities"]
        Nanostores["nanostores@1.1.0
        State Management"]
        TimeAgo["javascript-time-ago@2.5.12"]
    end

    subgraph Backend["Backend Modules"]
        AIModule["AI Module"]
        FilesModule["Files Module"]
        TextModule["TextExtraction Module"]
        MindmapsModule["Mindmaps Module"]
    end

    Astro --> Backend

    AIModule --> AISDK
    AISDK --> HFProvider
    AISDK --> CohereProvider

    FilesModule --> Multer
    FilesModule --> Node

    TextModule --> PDFExtract
    TextModule --> Level
    TextModule --> BSON

    MindmapsModule --> AIModule
    MindmapsModule --> FilesModule
    MindmapsModule --> TextModule

    Backend --> Markmap
    Markmap --> MarkmapCommon
    Markmap --> MarkmapLib
    Markmap --> MarkmapToolbar
    Markmap --> MarkmapView

    Backend --> CodeMirror
    CodeMirror --> CMSetup
    CodeMirror --> CMState
    CodeMirror --> CMView

    Astro --> Tailwind
    Tailwind --> TailwindVite

    Backend --> Nanostores
    Backend --> TimeAgo

    style Core fill:#1976d2,stroke:#0d47a1,stroke-width:2px,color:#fff
    style AI fill:#4caf50,stroke:#2e7d32,stroke-width:2px,color:#fff
    style Storage fill:#ff9800,stroke:#e65100,stroke-width:2px,color:#fff
    style Backend fill:#9c27b0,stroke:#4a148c,stroke-width:3px,color:#fff
```

---

## 6. Diagrama de Tecnologías y Capas

```mermaid
graph TB
    subgraph Client["Cliente / Browser"]
        Browser["Browser
        - HTTP Client
        - SSE Consumer"]
    end

    subgraph Presentation["Capa de Presentación"]
        AstroPages["Astro Pages
        - SSR Components
        - API Routes"]
        Markmap["Markmap Visualization"]
        CodeMirror["CodeMirror Editor"]
    end

    subgraph API["Capa de API / Routers"]
        FilesRoute["Files Routes
        GET, POST, DELETE
        /api/file/*"]
        MindmapsRoute["Mindmaps Routes
        POST /api/mindmaps/*
        Streaming Support"]
        TextsRoute["Texts Routes
        GET, DELETE
        /api/texts/*"]
    end

    subgraph Business["Capa de Negocio"]
        FilesLogic["Files Business Logic
        - Upload Management
        - File CRUD"]
        TextLogic["Text Extraction Logic
        - PDF Processing
        - Metadata Management"]
        AILogic["AI Logic
        - Prompt Engineering
        - Streaming Control"]
        OrchLogic["Orchestration Logic
        - Mindmap Generation
        - Multi-step Workflows"]
    end

    subgraph Data["Capa de Datos"]
        FSStorage["File System
        ./uploads/"]
        CSVData["CSV Database
        files.csv"]
        LevelDBData["LevelDB
        texts database"]
    end

    subgraph External["Servicios Externos"]
        HFAPI["Hugging Face API
        deepseek-ai/DeepSeek-V3-0324"]
    end

    Browser <-->|HTTP/SSE| AstroPages
    AstroPages --> Markmap
    AstroPages --> CodeMirror
    AstroPages --> FilesRoute
    AstroPages --> MindmapsRoute
    AstroPages --> TextsRoute

    FilesRoute --> FilesLogic
    MindmapsRoute --> OrchLogic
    TextsRoute --> TextLogic

    OrchLogic --> FilesLogic
    OrchLogic --> TextLogic
    OrchLogic --> AILogic

    FilesLogic --> FSStorage
    FilesLogic --> CSVData
    TextLogic --> LevelDBData
    AILogic --> HFAPI

    style Client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Presentation fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style API fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Business fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style Data fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style External fill:#efebe9,stroke:#5d4037,stroke-width:2px
```

---

## 7. Diagrama de Patrones de Diseño Implementados

```mermaid
graph TB
    subgraph Patterns["Patrones de Diseño Implementados"]

        subgraph Architectural["Patrones Arquitectónicos"]
            CleanArch["Clean Architecture
            - Separación por capas
            - Dependencias hacia dentro"]
            Hexagonal["Hexagonal Architecture
            - Puertos (Interfaces)
            - Adaptadores (Implementaciones)"]
            Modular["Modular Architecture
            - Módulos independientes
            - Exports centralizados"]
        end

        subgraph Creational["Patrones Creacionales"]
            DI["Dependency Injection
            - Constructor-based
            - Interface-driven"]
            Singleton["Singleton
            - DB connection
            - Module instances"]
            Factory["Factory Pattern
            - index.ts exports
            - Instance creation"]
        end

        subgraph Structural["Patrones Estructurales"]
            Repository["Repository Pattern
            - Data abstraction
            - Multiple implementations"]
            Adapter["Adapter Pattern
            - Storage adapters
            - Provider adapters"]
            Facade["Facade Pattern
            - UseCases as facade
            - Simplified interfaces"]
        end

        subgraph Behavioral["Patrones Comportamentales"]
            Strategy["Strategy Pattern
            - AIProvider strategy
            - Storage strategy"]
            Iterator["Iterator Pattern
            - AsyncGenerator
            - Streaming responses"]
            Orchestrator["Orchestrator Pattern
            - Mindmaps orchestration
            - Multi-service coordination"]
        end

        subgraph Data["Patrones de Datos"]
            DTO["DTO Pattern
            - Data transfer objects
            - Layer separation"]
            Domain["Domain Entity
            - Business logic
            - Text entity"]
        end
    end

    subgraph Implementation["Implementación en el Código"]
        FilesModule["Files Module"]
        TextModule["TextExtraction Module"]
        AIModule["AI Module"]
        MindmapsModule["Mindmaps Module"]
    end

    CleanArch -.->|aplicado en| FilesModule
    Hexagonal -.->|aplicado en| TextModule
    Modular -.->|aplicado en| AIModule

    DI -.->|usado en| FilesModule
    DI -.->|usado en| MindmapsModule
    Singleton -.->|usado en| TextModule
    Factory -.->|usado en| FilesModule

    Repository -.->|implementado en| FilesModule
    Repository -.->|implementado en| TextModule
    Adapter -.->|implementado en| AIModule
    Facade -.->|implementado en| MindmapsModule

    Strategy -.->|implementado en| AIModule
    Iterator -.->|implementado en| AIModule
    Orchestrator -.->|implementado en| MindmapsModule

    DTO -.->|usado en todos| Implementation
    Domain -.->|implementado en| TextModule

    style Architectural fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Creational fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style Structural fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Behavioral fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Data fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style Implementation fill:#ffeb3b,stroke:#f57f17,stroke-width:3px
```

---

## 8. Diagrama de Ciclo de Vida de una Request

```mermaid
stateDiagram-v2
    [*] --> ClientRequest: POST /api/mindmaps/stream/[id]

    ClientRequest --> RouteHandler: Astro captures request
    RouteHandler --> ExtractParams: Parse fileId from body
    ExtractParams --> CallRouter: mindmapsRouter.generateMindmapFromFileStream()

    CallRouter --> ValidateInput: Check fileId exists
    ValidateInput --> GetFile: filesApi.getFileById()

    state GetFile {
        [*] --> QueryCSV: repository.getFileById()
        QueryCSV --> LoadBuffer: storage.loadFileBuffer()
        LoadBuffer --> ReturnFile: Combine metadata + buffer
        ReturnFile --> [*]
    }

    GetFile --> ExtractText: textExtractorApi.extractTextFromPDF()

    state ExtractText {
        [*] --> ParsePDF: pdfTextExtractor.extractTextFromPDF()
        ParsePDF --> ExtractMetadata: Get author, title, pages
        ExtractMetadata --> SaveToDB: repository.saveTextById()
        SaveToDB --> ReturnTextDTO
        ReturnTextDTO --> [*]
    }

    ExtractText --> BuildPrompt: Generate Markmap prompt
    BuildPrompt --> StreamAI: aiApi.streamCompletion()

    state StreamAI {
        [*] --> CallHuggingFace: POST to DeepSeek V3
        CallHuggingFace --> ReceiveChunk
        ReceiveChunk --> YieldChunk: yield chunk
        YieldChunk --> MoreChunks: Has more?
        MoreChunks --> ReceiveChunk: Yes
        MoreChunks --> StreamComplete: No
        StreamComplete --> [*]
    }

    StreamAI --> CreateReadableStream: Convert AsyncGenerator
    CreateReadableStream --> SetHeaders: Content-Type: text/event-stream
    SetHeaders --> StreamResponse: Stream chunks to client

    StreamResponse --> ClientReceives: SSE: data: chunk
    ClientReceives --> UpdateUI: Render Markmap
    UpdateUI --> MoreData: Stream continues?
    MoreData --> ClientReceives: Yes
    MoreData --> Complete: No

    Complete --> [*]

    note right of ValidateInput
        Error handling:
        - File not found
        - Invalid fileId
        - Extraction failed
    end note

    note right of StreamAI
        Streaming configuration:
        - CORS enabled
        - Cache: no-cache
        - Keep-alive active
    end note
```

---

## Resumen de Diagramas

### Diagramas Incluidos:

1. **Estructura de Directorios y Módulos**: Organización física del código
2. **Arquitectura Hexagonal**: Capas, puertos y adaptadores
3. **Flujo de Datos Completo**: Secuencia de interacciones entre componentes
4. **Mapa de Dependencias**: Relaciones entre módulos y capas
5. **Dependencias de Paquetes**: Árbol de dependencias npm
6. **Tecnologías y Capas**: Stack completo por capa de aplicación
7. **Patrones de Diseño**: Todos los patrones implementados
8. **Ciclo de Vida de Request**: Estado de una request completa

### Cómo Visualizar:

Estos diagramas están en formato **Mermaid** y se pueden visualizar en:
- GitHub (renderiza automáticamente)
- VS Code con extensión "Markdown Preview Mermaid Support"
- Sitios web: mermaid.live, mermaid-js.github.io
- IDEs que soportan Mermaid

### Convenciones de Colores:

- 🔵 **Azul**: Framework/Core
- 🟣 **Morado**: Módulos de negocio
- 🟢 **Verde**: Servicios y lógica
- 🟠 **Naranja**: Infraestructura
- 🔴 **Rojo**: Datos y persistencia
- ⚫ **Gris**: Servicios externos
