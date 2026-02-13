import type { VectorEntry } from "../../domain/ports/VectorStoreAdapter";

export interface VectorEntryDTO {
  id: string;
  semanticUnitId: string;
  vector: number[];
  content: string;
  metadata: Record<string, unknown>;
}

export function toDTO(entry: VectorEntry): VectorEntryDTO {
  return {
    id: entry.id,
    semanticUnitId: entry.semanticUnitId,
    vector: [...entry.vector],
    content: entry.content,
    metadata: { ...entry.metadata },
  };
}

export function fromDTO(dto: VectorEntryDTO): VectorEntry {
  return {
    id: dto.id,
    semanticUnitId: dto.semanticUnitId,
    vector: dto.vector,
    content: dto.content,
    metadata: dto.metadata,
  };
}
