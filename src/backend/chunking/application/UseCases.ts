import type { ChunkingConfig } from "../@core-contracts/chunking";
import type { ChunkMetadata } from "../@core-contracts/chunking";
import type { ProcessedDocument } from "../@core-contracts/dtos";
import type { Chunk } from "../@core-contracts/chunking";
import type { ChunkerFactory } from "../@core-contracts/chunking";

export class UseCases {
  constructor(private chunkerFactory: ChunkerFactory) {}

  chunkOne = async (
    text: string,
    config: ChunkingConfig,
    documentMetadata?: Partial<ChunkMetadata>
  ): Promise<ProcessedDocument> => {
    const startTime = Date.now();
    const documentId = crypto.randomUUID();

    console.log({ config });
    const chunker = this.chunkerFactory.create(config);

    let chunks: Chunk[];

    // Manejar chunkers asíncronos (semantic)
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

    return {
      documentId,
      chunks,
      metadata: {
        originalLength: text.length,
        chunksCount: chunks.length,
        strategy: config.strategy,
        processingTime,
      },
    };
  };

  chunkMultiple = async (
    documents: Array<{ text: string; metadata?: Partial<ChunkMetadata> }>,
    config: ChunkingConfig
  ): Promise<ProcessedDocument[]> => {
    return Promise.all(
      documents.map((doc) => this.chunkOne(doc.text, config, doc.metadata))
    );
  };
}
