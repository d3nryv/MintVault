import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }
}
