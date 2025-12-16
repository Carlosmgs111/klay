import type { FilesApi } from "./@core-contracts/filesApi";
import type { Storage } from "./@core-contracts/storage";
import type { Repository } from "./@core-contracts/repository";
// import { Api } from "./application/Api";
import { FilesUseCases } from "./application/UseCases";
import { LocalFsStorage } from "./infrastructure/storage/LocalFsStorage";
import { AstroRouter } from "./infrastructure/routes/AstroRouter";
import { LocalCsvRepository } from "./infrastructure/repository/LocalCsvRepository";

const storage: Storage = new LocalFsStorage();
const repository: Repository = new LocalCsvRepository();
export const filesApi: FilesApi = new FilesUseCases(storage, repository);

// export const filesApi: FilesApi = new Api(filesUseCases);
export const filesRouter = new AstroRouter(filesApi);
