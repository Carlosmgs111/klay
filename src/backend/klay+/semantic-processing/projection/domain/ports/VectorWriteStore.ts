import type { VectorEntry } from "../../../../shared/domain/VectorEntry";

export interface VectorWriteStore {
  upsert(entries: VectorEntry[]): Promise<void>;
  delete(ids: string[]): Promise<void>;
  deleteBySemanticUnitId(semanticUnitId: string): Promise<void>;
}
