import { filesApiFactory } from "@/modules/files";
import { AstroRouter } from "@/modules/files/infrastructure/routes/AstroRouter";

const filesRouter = new AstroRouter(filesApiFactory);

export const GET = filesRouter.getAllFiles;