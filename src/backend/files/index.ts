import type { FileManagePort } from "./@core-contracts/fileManagePort";
import type { Storage } from "./@core-contracts/storage";
import type { Repository } from "./@core-contracts/repository";
import { FileManageApi } from "./application/FileManageApi";
import { FileManageUseCases } from "./application/UseCases";
import { LocalFsStorage } from "./infrastructure/storage/LocalFsStorage";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { LocalCsvRepository } from "./infrastructure/repository/LocalCsvRepository";

const storage: Storage = new LocalFsStorage();
const repository: Repository = new LocalCsvRepository();
const fileManagerUseCases = new FileManageUseCases(storage, repository);

export const fileManagerApi: FileManagePort = new FileManageApi(
  fileManagerUseCases
);
export const fileManagerRouter = new AstroRouter(fileManagerApi);
