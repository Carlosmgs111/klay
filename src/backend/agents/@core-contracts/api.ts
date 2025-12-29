import type { AICompletionDTO, AgentDTO } from "./dtos";

export interface AIApi {
    streamCompletion(agentId: string, command: AICompletionDTO): AsyncGenerator<string>;
    generateCompletion(agentId: string, command: AICompletionDTO): Promise<string>;
    createNewAgent(agent: AgentDTO): string;
}