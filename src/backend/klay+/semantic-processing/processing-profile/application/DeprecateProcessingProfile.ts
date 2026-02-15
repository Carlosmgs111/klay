import type { EventPublisher } from "../../../shared/domain/index";
import { Result } from "../../../shared/domain/Result";
import { ProcessingProfileId } from "../domain/ProcessingProfileId";
import type { ProcessingProfile } from "../domain/ProcessingProfile";
import type { ProcessingProfileRepository } from "../domain/ProcessingProfileRepository";
import {
  ProfileNotFoundError,
  ProfileAlreadyDeprecatedError,
  type ProfileError,
} from "../domain/errors";

export interface DeprecateProcessingProfileCommand {
  id: string;
  reason: string;
}

export class DeprecateProcessingProfile {
  constructor(
    private readonly repository: ProcessingProfileRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: DeprecateProcessingProfileCommand,
  ): Promise<Result<ProfileError, ProcessingProfile>> {
    // ─── Find Profile ─────────────────────────────────────────────────────
    const profileId = ProcessingProfileId.create(command.id);
    const profile = await this.repository.findById(profileId);

    if (!profile) {
      return Result.fail(new ProfileNotFoundError(command.id));
    }

    if (profile.isDeprecated) {
      return Result.fail(new ProfileAlreadyDeprecatedError(command.id));
    }

    // ─── Deprecate Profile ────────────────────────────────────────────────
    profile.deprecate(command.reason);

    // ─── Persist and Publish ──────────────────────────────────────────────
    await this.repository.save(profile);
    await this.eventPublisher.publishAll(profile.clearEvents());

    return Result.ok(profile);
  }
}
