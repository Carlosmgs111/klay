import { embeddingApiFactory } from "@/modules/embeddings";
import { AstroRouter } from "@/modules/embeddings/infrastructure/routes/AstroRouter";

const embeddingsRouter = new AstroRouter(embeddingApiFactory);

export const POST = embeddingsRouter.generateEmbeddings;
export const GET = embeddingsRouter.getAllDocuments;
export const PUT = embeddingsRouter.search;

