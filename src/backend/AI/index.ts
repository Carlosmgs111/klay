import { AISDKProvider } from "./infrastructure/AIProvider/AIProvider";
import { AIUsesCases } from "./application/AIUsesCases";

export const aiProvider = new AISDKProvider();
export const aiUsesCases = new AIUsesCases(aiProvider);

