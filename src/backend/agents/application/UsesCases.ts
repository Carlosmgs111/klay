import type { AIProvider } from "../@core-contracts/providers";
import type { AgentRepository } from "../@core-contracts/repositories";
import type { PromptBuilder } from "../@core-contracts/services";
import type { AICompletionDTO, AgentDTO } from "../@core-contracts/dtos";
import { Agent } from "../domain/Agent";

export class AIUsesCases {
  constructor(
    private aiProvider: AIProvider,
    private agentRepository: AgentRepository  // private promptBuilder: PromptBuilder
  ) {}

  async *streamCompletion(agentId: string, command: AICompletionDTO) {
    const { systemPrompt, userPrompt } = command;
    for await (const chunk of this.aiProvider.streamCompletion(command)) {
      yield chunk;
    }
  }

  async generateCompletion(agentId: string, command: AICompletionDTO) {
    const agent = this.agentRepository.getAgentById(agentId);
    return await this.aiProvider.generateCompletion(command);
  }

  createNewAgent(agent: AgentDTO) {
    const agentDomain = new Agent(agent);
    this.agentRepository.saveAgentById(
      agentDomain.toDTO().id,
      agentDomain.toDTO()
    );
    return agentDomain.toDTO().id;
  }
}
