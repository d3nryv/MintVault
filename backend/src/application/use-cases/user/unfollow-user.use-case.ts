import { UserRepository } from "../../../domain/repositories/user.repository";

export class UnfollowUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    return this.userRepository.unfollow(followerId, followingId);
  }
}
