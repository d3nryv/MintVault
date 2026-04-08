import { UserRepository } from '../../../domain/repositories/user.repository';
import { LoginUserDto } from '../../dtos/user.dto';
import { CustomError } from '../../../domain/errors/custom.error';
import { BcryptAdapter } from '../../../infrastructure/config/bcrypt.adapter';
import { UserEntity } from '../../../domain/entities/user.entity';

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: LoginUserDto): Promise<boolean | UserEntity> {
    const { username, password } = dto;

    if (!username || !password) {
      throw CustomError.badRequest('Username and password are required');
    }

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw CustomError.badRequest('User not found');
    }

    const isMatch = BcryptAdapter.compare(password, user.password);
    if (!isMatch) {
      throw CustomError.badRequest('Invalid password');
    }

    // In a real scenario, we would return a token here.
    // As per user request, we can return true or the user profile.
    // Returning true as requested for now, or the user entity.
    return user; 
  }
}
