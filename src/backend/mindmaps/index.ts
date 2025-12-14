import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { PDFTextExtractor } from "./infrastructure/extraction/PDFTextExtractor";
import { fileManagerApi } from "../files";
import { MindmapUseCases } from "./application/UseCases";
import { LocalLevelRepository } from "./infrastructure/repository/LocalLevelRepository";
import { MindmapServices } from "./application/MindmapServices";
import { aiUsesCases } from "../AI";

const pdfTextExtractor = new PDFTextExtractor();
const textRepository = new LocalLevelRepository();
const mindmapServices = new MindmapServices(textRepository, pdfTextExtractor, aiUsesCases);
const mindmapUseCases = new MindmapUseCases(
  fileManagerApi,
  pdfTextExtractor,
  textRepository,
  mindmapServices,
);
export const mindmapRouter = new AstroRouter(mindmapUseCases);
