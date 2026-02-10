import type { ProcessingStrategyRepository } from "../domain/ProcessingStrategyRepository";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";

// ─── Use Cases ─────────────────────────────────────────────────────
export { RegisterStrategy } from "./RegisterStrategy";
export type { RegisterStrategyCommand } from "./RegisterStrategy";

// ─── Use Cases Facade ──────────────────────────────────────────────
import { RegisterStrategy } from "./RegisterStrategy";

export class StrategyRegistryUseCases {
  readonly registerStrategy: RegisterStrategy;

  constructor(repository: ProcessingStrategyRepository, eventPublisher: EventPublisher) {
    this.registerStrategy = new RegisterStrategy(repository, eventPublisher);
  }
}
