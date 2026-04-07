import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }
}
