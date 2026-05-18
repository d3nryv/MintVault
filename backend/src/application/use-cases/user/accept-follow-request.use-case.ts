import { UserRepository } from "../../../domain/repositories/user.repository";

export class AcceptFollowRequestUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error("You cannot accept a follow request from yourself");
    }
    return this.userRepository.acceptFollowRequest(followerId, followingId);
  }
}
