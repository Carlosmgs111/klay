import type { ProcessingProfileRepository } from "../domain/ProcessingProfileRepository";

export type ProcessingProfileInfraPolicy = "in-memory" | "browser" | "server";

export interface ProcessingProfileInfrastructurePolicy {
  type: ProcessingProfileInfraPolicy;
  dbPath?: string;
  dbName?: string;
}

export interface ResolvedProcessingProfileInfra {
  repository: ProcessingProfileRepository;
}
