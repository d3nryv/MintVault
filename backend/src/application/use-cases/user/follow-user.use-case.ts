import { UserRepository } from "../../../domain/repositories/user.repository";

export class FollowUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error("You cannot follow yourself");
    }

    const userToFollow = await this.userRepository.findById(followingId);
    if (!userToFollow) {
        throw new Error("User not found");
    }

    if (userToFollow.followers.includes(followerId)) {
        throw new Error("Already friends/following this user");
    }

    if (userToFollow.friendRequests.includes(followerId)) {
        throw new Error("Friend request already sent");
    }

    return this.userRepository.follow(followerId, followingId);
  }
}
