import {
  NotFoundError,
  AlreadyExistsError,
  ValidationError,
} from "../../../../shared/domain/errors";

// ─── Not Found Errors ────────────────────────────────────────────────────────

export class StrategyNotFoundError extends NotFoundError {
  constructor(strategyId: string) {
    super("ProcessingStrategy", strategyId);
  }
}

// ─── Already Exists Errors ───────────────────────────────────────────────────

export class StrategyAlreadyExistsError extends AlreadyExistsError {
  constructor(strategyId: string) {
    super("ProcessingStrategy", strategyId);
  }
}

// ─── Validation Errors ───────────────────────────────────────────────────────

export class StrategyNameRequiredError extends ValidationError {
  constructor() {
    super("ProcessingStrategy", "name", "Strategy name is required");
  }
}

export class StrategyInvalidTypeError extends ValidationError {
  constructor(type: string, validTypes: string[]) {
    super(
      "ProcessingStrategy",
      "type",
      `Invalid strategy type: ${type}. Valid types: ${validTypes.join(", ")}`,
    );
  }
}

export class StrategyInvalidConfigurationError extends ValidationError {
  constructor(field: string, reason: string) {
    super("ProcessingStrategy", `configuration.${field}`, reason);
  }
}

// ─── Type Alias for Union ────────────────────────────────────────────────────

export type StrategyError =
  | StrategyNotFoundError
  | StrategyAlreadyExistsError
  | StrategyNameRequiredError
  | StrategyInvalidTypeError
  | StrategyInvalidConfigurationError;
