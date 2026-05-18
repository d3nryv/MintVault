import { UserRepository } from "../../../domain/repositories/user.repository";

export class RejectFollowRequestUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error("You cannot reject a follow request from yourself");
    }
    return this.userRepository.rejectFollowRequest(followerId, followingId);
  }
}
