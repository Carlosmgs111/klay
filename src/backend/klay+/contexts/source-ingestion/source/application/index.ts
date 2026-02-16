import type { SourceRepository } from "../domain/SourceRepository";
import type { EventPublisher } from "../../../../shared/domain/EventPublisher";

// ─── Use Cases ─────────────────────────────────────────────────────
export { RegisterSource } from "./RegisterSource";
export type { RegisterSourceCommand } from "./RegisterSource";

export { UpdateSource } from "./UpdateSource";
export type { UpdateSourceCommand } from "./UpdateSource";

// ─── Use Cases Facade ──────────────────────────────────────────────
import { RegisterSource } from "./RegisterSource";
import { UpdateSource } from "./UpdateSource";

export class SourceUseCases {
  readonly registerSource: RegisterSource;
  readonly updateSource: UpdateSource;

  constructor(
    repository: SourceRepository,
    eventPublisher: EventPublisher,
  ) {
    this.registerSource = new RegisterSource(repository, eventPublisher);
    this.updateSource = new UpdateSource(repository, eventPublisher);
  }
}
