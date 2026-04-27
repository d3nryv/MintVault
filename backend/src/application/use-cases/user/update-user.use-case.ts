import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UpdateUserDto } from '../../dtos/user.dto';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    return this.userRepository.update(id, dto);
  }
}
