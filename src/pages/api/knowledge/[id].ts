import { knowledgeAssetsApiFactory } from "@/modules/knowledge-assets";
import { AstroRouter } from "@/modules/knowledge-assets/infrastructure/routes/AstroRouter";

const knowledgeAssetsRouter = new AstroRouter(knowledgeAssetsApiFactory);

export const POST = knowledgeAssetsRouter.generateKnowledgeStreamingState;