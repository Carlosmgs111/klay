import { filesApi } from "../files";
import { textExtractorApi } from "../textExtraction";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { UseCases } from "./application/UseCases";

export const mindmapsApi = new UseCases(filesApi, textExtractorApi);
export const mindmapsRouter = new AstroRouter(mindmapsApi);
