import { type IFileManagerUseCases } from "./@core-contracts/application/useCases";
import { type IStorage } from "./@core-contracts/domain/storage";
import { type IRepository } from "./@core-contracts/domain/repository";
import { FileManagerUseCases } from "./application/UseCases";
import { LocalFsStorage } from "./infrastructure/storage/LocalFsStorage";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { LocalCsvRepository } from "./infrastructure/repository/LocalCsvRepository";

const storage: IStorage = new LocalFsStorage();
const repository: IRepository = new LocalCsvRepository();
export const fileManagerUseCases: IFileManagerUseCases = new FileManagerUseCases(storage, repository);

export const fileManagerRouter = new AstroRouter(fileManagerUseCases);
