import { astroRouter } from "../../../backend/embeddings";

export const POST = astroRouter.generateEmbeddings;
export const GET = astroRouter.getAllDocuments;
export const PUT = astroRouter.search;

