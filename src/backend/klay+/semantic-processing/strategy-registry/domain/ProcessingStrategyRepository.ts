import type { Repository } from "../../../shared/domain/index";
import type { ProcessingStrategy } from "./ProcessingStrategy";
import type { StrategyId } from "./StrategyId";
import type { StrategyType } from "./StrategyType";

export interface ProcessingStrategyRepository extends Repository<ProcessingStrategy, StrategyId> {
  findByType(type: StrategyType): Promise<ProcessingStrategy[]>;
  findActiveByType(type: StrategyType): Promise<ProcessingStrategy | null>;
}
