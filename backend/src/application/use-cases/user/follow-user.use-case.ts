import { UserRepository } from "../../../domain/repositories/user.repository";

export class FollowUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error("You cannot follow yourself");
    }
    return this.userRepository.follow(followerId, followingId);
  }
}
