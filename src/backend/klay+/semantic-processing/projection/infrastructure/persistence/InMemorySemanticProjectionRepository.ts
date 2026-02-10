import type { SemanticProjectionRepository } from "../../domain/SemanticProjectionRepository";
import type { SemanticProjection } from "../../domain/SemanticProjection";
import type { ProjectionId } from "../../domain/ProjectionId";
import type { ProjectionType } from "../../domain/ProjectionType";
import type { ProjectionStatus } from "../../domain/ProjectionStatus";

export class InMemorySemanticProjectionRepository implements SemanticProjectionRepository {
  private store = new Map<string, SemanticProjection>();

  async save(entity: SemanticProjection): Promise<void> {
    this.store.set(entity.id.value, entity);
  }

  async findById(id: ProjectionId): Promise<SemanticProjection | null> {
    return this.store.get(id.value) ?? null;
  }

  async delete(id: ProjectionId): Promise<void> {
    this.store.delete(id.value);
  }

  async findBySemanticUnitId(semanticUnitId: string): Promise<SemanticProjection[]> {
    return [...this.store.values()].filter(
      (p) => p.semanticUnitId === semanticUnitId,
    );
  }

  async findBySemanticUnitIdAndType(
    semanticUnitId: string,
    type: ProjectionType,
  ): Promise<SemanticProjection | null> {
    for (const projection of this.store.values()) {
      if (
        projection.semanticUnitId === semanticUnitId &&
        projection.type === type
      ) {
        return projection;
      }
    }
    return null;
  }

  async findByStatus(status: ProjectionStatus): Promise<SemanticProjection[]> {
    return [...this.store.values()].filter((p) => p.status === status);
  }
}
