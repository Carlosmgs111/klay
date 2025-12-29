/*
 * this is module will process input and output flow with AI
 * - Process user input
 *   - Build prompt template from user request
 *   - Save prompt template in database
 *   - Pass prompt template to AI
 * - Process AI output
 *   - Save AI response in a database
 *   - Return AI response to user
 * - Agents capabilities
 *   - Use of tool
 */
import type { AIApi } from "./@core-contracts/api";
import { AISDKProvider } from "./infrastructure/AIProvider/AIProvider";
import { AIUsesCases } from "./application/UsesCases";
import { LocalLevelAgentRepository } from "./infrastructure/Repositories/LocalLevelAgentRepository";
import { AstroRouter } from "./infrastructure/AstroRouter";

const agentRepository = new LocalLevelAgentRepository();
const aiProvider = new AISDKProvider();
aiProvider.setAgent({
  model: "deepseek-ai/DeepSeek-V3-0324",
  id: "1",
  name: "DeepSeek",
  description: "DeepSeek",
  instructions: "DeepSeek",
  tools: [],
});
export const aiApi: AIApi = new AIUsesCases(aiProvider, agentRepository);
export const router = new AstroRouter(aiApi);
