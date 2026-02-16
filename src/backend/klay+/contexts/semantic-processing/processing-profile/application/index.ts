import type { ProcessingProfileRepository } from "../domain/ProcessingProfileRepository";
import type { EventPublisher } from "../../../../shared/domain/EventPublisher";
import { CreateProcessingProfile } from "./CreateProcessingProfile";
import { UpdateProcessingProfile } from "./UpdateProcessingProfile";
import { DeprecateProcessingProfile } from "./DeprecateProcessingProfile";

export { CreateProcessingProfile } from "./CreateProcessingProfile";
export { UpdateProcessingProfile } from "./UpdateProcessingProfile";
export { DeprecateProcessingProfile } from "./DeprecateProcessingProfile";

export type {
  CreateProcessingProfileCommand,
} from "./CreateProcessingProfile";
export type {
  UpdateProcessingProfileCommand,
} from "./UpdateProcessingProfile";
export type {
  DeprecateProcessingProfileCommand,
} from "./DeprecateProcessingProfile";

/**
 * Aggregated use cases for the ProcessingProfile module.
 */
export class ProcessingProfileUseCases {
  readonly createProfile: CreateProcessingProfile;
  readonly updateProfile: UpdateProcessingProfile;
  readonly deprecateProfile: DeprecateProcessingProfile;

  constructor(
    repository: ProcessingProfileRepository,
    eventPublisher: EventPublisher,
  ) {
    this.createProfile = new CreateProcessingProfile(repository, eventPublisher);
    this.updateProfile = new UpdateProcessingProfile(repository, eventPublisher);
    this.deprecateProfile = new DeprecateProcessingProfile(repository, eventPublisher);
  }
}
