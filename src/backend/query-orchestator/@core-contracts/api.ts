import type { AICompletionDTO } from "../@core-contracts/dtos";

export interface QueryOrchestatorApi {
    streamCompletionWithContext(command: AICompletionDTO): AsyncGenerator<string>;
}