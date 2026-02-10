import type { SemanticProjectionRepository } from "../../../domain/SemanticProjectionRepository";
import type { SemanticProjection } from "../../../domain/SemanticProjection";
import type { ProjectionId } from "../../../domain/ProjectionId";
import type { ProjectionType } from "../../../domain/ProjectionType";
import type { ProjectionStatus } from "../../../domain/ProjectionStatus";
import { NeDBStore } from "../../../../../shared/infrastructure/nedb/NeDBStore";
import { toDTO, fromDTO, type ProjectionDTO } from "../indexeddb/ProjectionDTO";

export class NeDBSemanticProjectionRepository implements SemanticProjectionRepository {
  private store: NeDBStore<ProjectionDTO>;

  constructor(filename?: string) {
    this.store = new NeDBStore<ProjectionDTO>(filename);
  }

  async save(entity: SemanticProjection): Promise<void> {
    await this.store.put(entity.id.value, toDTO(entity));
  }

  async findById(id: ProjectionId): Promise<SemanticProjection | null> {
    const dto = await this.store.get(id.value);
    return dto ? fromDTO(dto) : null;
  }

  async delete(id: ProjectionId): Promise<void> {
    await this.store.remove(id.value);
  }

  async findBySemanticUnitId(semanticUnitId: string): Promise<SemanticProjection[]> {
    const results = await this.store.find((d) => d.semanticUnitId === semanticUnitId);
    return results.map(fromDTO);
  }

  async findBySemanticUnitIdAndType(
    semanticUnitId: string,
    type: ProjectionType,
  ): Promise<SemanticProjection | null> {
    const found = await this.store.findOne(
      (d) => d.semanticUnitId === semanticUnitId && d.type === type,
    );
    return found ? fromDTO(found) : null;
  }

  async findByStatus(status: ProjectionStatus): Promise<SemanticProjection[]> {
    const results = await this.store.find((d) => d.status === status);
    return results.map(fromDTO);
  }
}
