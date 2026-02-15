import type { ProcessingProfileInfrastructurePolicy } from "./infra-policies";
import type { ProcessingProfileUseCases } from "../application/index";
import type { ProcessingProfileRepository } from "../domain/ProcessingProfileRepository";

export interface ProcessingProfileFactoryResult {
  useCases: ProcessingProfileUseCases;
  /** Exposed for cross-module coordination (e.g., GenerateProjection lookups) */
  repository: ProcessingProfileRepository;
}

/**
 * Factory function for the ProcessingProfile module.
 * Resolves infrastructure and creates use cases.
 *
 * Returns both useCases (for facade) and repository (for cross-module wiring).
 */
export async function processingProfileFactory(
  policy: ProcessingProfileInfrastructurePolicy,
): Promise<ProcessingProfileFactoryResult> {
  const { ProcessingProfileComposer } = await import(
    "./ProcessingProfileComposer"
  );
  const { ProcessingProfileUseCases } = await import("../application/index");
  const { InMemoryEventPublisher } = await import(
    "../../../shared/infrastructure/InMemoryEventPublisher"
  );

  const infra = await ProcessingProfileComposer.resolve(policy);
  const eventPublisher = new InMemoryEventPublisher();

  const useCases = new ProcessingProfileUseCases(
    infra.repository,
    eventPublisher,
  );

  return { useCases, repository: infra.repository };
}
