import type { ProcessingStrategyRepository } from "../domain/ProcessingStrategyRepository";
import type { EventPublisher } from "../../../shared/domain/EventPublisher";

export type StrategyRegistryInfraPolicy = "in-memory" | "browser" | "server";

export interface StrategyRegistryInfrastructurePolicy {
  type: StrategyRegistryInfraPolicy;
  dbPath?: string;
  dbName?: string;
}

export interface ResolvedStrategyRegistryInfra {
  repository: ProcessingStrategyRepository;
  eventPublisher: EventPublisher;
}
