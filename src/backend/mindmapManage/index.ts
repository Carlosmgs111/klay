import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { PDFTextExtractor } from "./infrastructure/extraction/PDFTextExtractor";
import { fileManagerUseCases } from "../fileManage";
import { MindmapUseCases } from "./application/UseCases";
import {LocalLevelRepository} from "./infrastructure/repository/LocalLevelRepository";

const pdfTextExtractor = new PDFTextExtractor();
const textRepository = new LocalLevelRepository();
const mindmapUseCases = new MindmapUseCases(
  fileManagerUseCases,
  pdfTextExtractor,
  textRepository
);
export const mindmapRouter = new AstroRouter(mindmapUseCases);
