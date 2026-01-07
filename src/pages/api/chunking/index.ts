import { chunkingApiFactory } from "@/modules/chunking";
import { AstroRouter } from "@/modules/chunking/infrastructure/AstroRouter";

const chunkingRouter = new AstroRouter(chunkingApiFactory);

export const POST = chunkingRouter.chunkText;
