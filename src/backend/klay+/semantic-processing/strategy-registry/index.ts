/**
 * Strategy Registry Module - Public API
 *
 * This module manages processing strategies (chunking, embedding, ranking).
 * It provides a registry for configuring and selecting different processing approaches.
 */

// ─── Domain ─────────────────────────────────────────────────────────────────
export {
  ProcessingStrategy,
  StrategyId,
  StrategyType,
  // Domain Errors
  StrategyNotFoundError,
  StrategyAlreadyExistsError,
  StrategyNameRequiredError,
  StrategyInvalidTypeError,
  StrategyInvalidConfigurationError,
} from "./domain/index";

export type {
  ProcessingStrategyRepository,
  StrategyError,
} from "./domain/index";

// ─── Application ────────────────────────────────────────────────────────────
export { RegisterStrategy, StrategyRegistryUseCases } from "./application/index";
export type { RegisterStrategyCommand } from "./application/index";

// ─── Composition & Factory ──────────────────────────────────────────────────
export { StrategyRegistryComposer, strategyRegistryFactory } from "./composition/index";
export type {
  StrategyRegistryInfraPolicy,
  StrategyRegistryInfrastructurePolicy,
  ResolvedStrategyRegistryInfra,
  StrategyRegistryFactoryResult,
} from "./composition/index";
