import { knowledgeAssetsApiFactory } from "@/backend/knowledge-base/orchestrator";
import { AstroRouter } from "@/backend/knowledge-base/orchestrator/infrastructure/routes/AstroRouter";
const astroRouter = new AstroRouter(knowledgeAssetsApiFactory);

export const GET = astroRouter.getAllKnowledgeAssets;
