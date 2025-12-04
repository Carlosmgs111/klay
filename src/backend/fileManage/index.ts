import { FileManagerUseCases } from "./application/UseCases";
import { LocalFsStorage } from "./infrastructure/storage/LocalFsStorage";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { LocalCsvRepository } from "./infrastructure/repository/LocalCsvRepository";

const storage = new LocalFsStorage();
const repository = new LocalCsvRepository();
export const fileManagerUseCases = new FileManagerUseCases(storage, repository);

export const fileManagerRouter = new AstroRouter(fileManagerUseCases);
