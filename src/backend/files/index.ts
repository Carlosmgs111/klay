/*
 * Manage files
 * Upload, download, delete, list
 */

import type { FilesApi } from "./@core-contracts/api";
import type { FilesInfrastructurePolicy } from "./@core-contracts/infrastructurePolicies";
import { FilesUseCases } from "./application/UseCases";
import { FilesInfrastructureResolver } from "./infrastructure/composition/Resolver";
import {AstroRouter} from "./infrastructure/routes/AstroRouter";

export function filesApiFactory(policy: FilesInfrastructurePolicy): FilesApi {
  const { storage, repository } = FilesInfrastructureResolver.resolve(policy);
  return new FilesUseCases(storage, repository);
}

export const filesRouter = new AstroRouter(filesApiFactory);

