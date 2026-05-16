import { UserRepository } from "../../../domain/repositories/user.repository";

export class EmptyCartUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    return this.userRepository.emptyCart(userId);
  }
}
