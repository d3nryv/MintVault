import { UserRepository } from "../../../domain/repositories/user.repository";

export class RemoveVendorFromCartUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, vendorId: string): Promise<void> {
    return this.userRepository.removeVendorItemsFromCart(userId, vendorId);
  }
}
