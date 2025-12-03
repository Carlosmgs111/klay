import { FileManagerUseCases } from "./application/UseCases";
import { LocalStorage } from "./infrastructure/storage/LocalStorage";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { LocalCsvDatabase } from "./infrastructure/database/LocalCsvDatabase";

export const fileManagerUseCases = new FileManagerUseCases(new LocalStorage(), new LocalCsvDatabase());

export const fileManagerRouter = new AstroRouter(fileManagerUseCases);
