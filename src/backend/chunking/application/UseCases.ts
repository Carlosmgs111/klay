import type {
  ChunkingConfig,
  ChunkingResultDTO,
} from "../@core-contracts/dtos";
import type {
  Chunk,
  ChunkMetadata,
  ChunkBatch,
} from "../@core-contracts/entities";
import type { ChunkerFactory } from "../@core-contracts/services";

export class UseCases {
  constructor(private chunkerFactory: ChunkerFactory) {}

  chunkOne = async (
    text: string,
    config: ChunkingConfig,
    documentMetadata?: Partial<ChunkMetadata>
  ): Promise<ChunkingResultDTO> => {
    const startTime = Date.now();
    const documentId = crypto.randomUUID();

    console.log({ config });
    const chunker = this.chunkerFactory.create(config);

    let chunks: Chunk[];

    if (
      config.strategy === "semantic" &&
      chunker instanceof
        (await import("../domain/strategies/SemanticChunker")).SemanticChunker
    ) {
      chunks = await chunker.chunk(text, {
        ...documentMetadata,
        source: documentMetadata?.source || documentId,
      });
    } else {
      chunks = await chunker.chunk(text, {
        ...documentMetadata,
        source: documentMetadata?.source || documentId,
      });
    }

    const processingTime = Date.now() - startTime;

    const chunkBatch: ChunkBatch = {
      chunks,
      metadata: {
        originalLength: text.length,
        chunksCount: chunks.length,
        strategy: config.strategy,
        processingTime,
      },
    };

    return {
      ...chunkBatch,
      status: "success",
      message: "Chunking completed successfully",
    };
  };

  chunkMultiple = async (
    documents: Array<{ text: string; metadata?: Partial<ChunkMetadata> }>,
    config: ChunkingConfig
  ): Promise<ChunkingResultDTO[]> => {
    return Promise.all(
      documents.map((doc) => this.chunkOne(doc.text, config, doc.metadata))
    );
  };
}
