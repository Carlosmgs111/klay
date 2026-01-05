/*
 * Manage files
 * Upload, download, delete, list
 */

import type { FilesApi } from "./@core-contracts/api";
import type { FilesInfrastructurePolicy } from "./@core-contracts/infrastructurePolicies";
import { FilesUseCases } from "./application/UseCases";
import { FilesInfrastructureResolver } from "./infrastructure/composition/Resolver";
// import {AstroRouter} from "./infrastructure/routes/AstroRouter";

export async function filesApiFactory(policy: FilesInfrastructurePolicy): Promise<FilesApi> {
  const { storage, repository } = await FilesInfrastructureResolver.resolve(policy);
  return new FilesUseCases(storage, repository);
}

// export const filesRouter = new AstroRouter(filesApiFactory);

