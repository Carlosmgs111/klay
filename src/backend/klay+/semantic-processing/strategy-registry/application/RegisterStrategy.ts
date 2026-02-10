import type { EventPublisher } from "../../../shared/domain/index";
import { Result } from "../../../shared/domain/Result";
import { ProcessingStrategy } from "../domain/ProcessingStrategy";
import { StrategyId } from "../domain/StrategyId";
import type { StrategyType } from "../domain/StrategyType";
import type { ProcessingStrategyRepository } from "../domain/ProcessingStrategyRepository";
import {
  StrategyAlreadyExistsError,
  StrategyNameRequiredError,
  type StrategyError,
} from "../domain/errors";

export interface RegisterStrategyCommand {
  id: string;
  name: string;
  type: StrategyType;
  configuration?: Record<string, unknown>;
}

export class RegisterStrategy {
  constructor(
    private readonly repository: ProcessingStrategyRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: RegisterStrategyCommand,
  ): Promise<Result<StrategyError, ProcessingStrategy>> {
    // ─── Validations ────────────────────────────────────────────────────
    if (!command.name || command.name.trim() === "") {
      return Result.fail(new StrategyNameRequiredError());
    }

    // ─── Check Existence ────────────────────────────────────────────────
    const strategyId = StrategyId.create(command.id);

    const existing = await this.repository.findById(strategyId);
    if (existing) {
      return Result.fail(new StrategyAlreadyExistsError(command.id));
    }

    // ─── Create Strategy ────────────────────────────────────────────────
    const strategy = ProcessingStrategy.register(
      strategyId,
      command.name,
      command.type,
      command.configuration ?? {},
    );

    // ─── Persist and Publish ────────────────────────────────────────────
    await this.repository.save(strategy);
    await this.eventPublisher.publishAll(strategy.clearEvents());

    return Result.ok(strategy);
  }
}
