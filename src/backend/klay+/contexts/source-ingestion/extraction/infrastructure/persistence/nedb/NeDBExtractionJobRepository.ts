import type { ExtractionJobRepository } from "../../../domain/ExtractionJobRepository";
import type { ExtractionJob } from "../../../domain/ExtractionJob";
import type { ExtractionJobId } from "../../../domain/ExtractionJobId";
import type { ExtractionStatus } from "../../../domain/ExtractionStatus";
import { NeDBStore } from "../../../../../../platform/persistence/nedb/NeDBStore";
import { toDTO, fromDTO, type ExtractionJobDTO } from "../indexeddb/ExtractionJobDTO";

export class NeDBExtractionJobRepository implements ExtractionJobRepository {
  private store: NeDBStore<ExtractionJobDTO>;

  constructor(filename?: string) {
    this.store = new NeDBStore<ExtractionJobDTO>(filename);
  }

  async save(entity: ExtractionJob): Promise<void> {
    await this.store.put(entity.id.value, toDTO(entity));
  }

  async findById(id: ExtractionJobId): Promise<ExtractionJob | null> {
    const dto = await this.store.get(id.value);
    return dto ? fromDTO(dto) : null;
  }

  async delete(id: ExtractionJobId): Promise<void> {
    await this.store.remove(id.value);
  }

  async findBySourceId(sourceId: string): Promise<ExtractionJob[]> {
    const results = await this.store.find((d) => d.sourceId === sourceId);
    return results.map(fromDTO);
  }

  async findByStatus(status: ExtractionStatus): Promise<ExtractionJob[]> {
    const results = await this.store.find((d) => d.status === status);
    return results.map(fromDTO);
  }
}
