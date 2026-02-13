import type {
  VectorStoreAdapter,
  VectorEntry,
  VectorSearchResult,
} from "../../domain/ports/VectorStoreAdapter";
import { NeDBStore } from "../../../../shared/infrastructure/nedb/NeDBStore";
import { cosineSimilarity } from "../../../../shared/infrastructure/hashVector";
import { toDTO, fromDTO, type VectorEntryDTO } from "./VectorEntryDTO";

export class NeDBVectorStore implements VectorStoreAdapter {
  private store: NeDBStore<VectorEntryDTO>;

  constructor(filename?: string) {
    this.store = new NeDBStore<VectorEntryDTO>(filename);
  }

  async upsert(entries: VectorEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.store.put(entry.id, toDTO(entry));
    }
  }

  async delete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.store.remove(id);
    }
  }

  async deleteBySemanticUnitId(semanticUnitId: string): Promise<void> {
    const matching = await this.store.find(
      (d) => d.semanticUnitId === semanticUnitId,
    );
    for (const dto of matching) {
      await this.store.remove(dto.id);
    }
  }

  async search(
    vector: number[],
    topK: number,
    filter?: Record<string, unknown>,
  ): Promise<VectorSearchResult[]> {
    let candidates = await this.store.getAll();

    if (filter) {
      candidates = candidates.filter((dto) =>
        Object.entries(filter).every(
          ([key, value]) => dto.metadata[key] === value,
        ),
      );
    }

    const scored: VectorSearchResult[] = candidates.map((dto) => ({
      entry: fromDTO(dto),
      score: cosineSimilarity(vector, dto.vector),
    }));

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
