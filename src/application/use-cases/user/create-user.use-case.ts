import { UserEntity } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { CreateUserDto } from '../../dtos/user.dto';
import { CustomError } from '../../../domain/errors/custom.error';
import { BcryptAdapter } from '../../../infrastructure/config/bcrypt.adapter';

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: CreateUserDto): Promise<UserEntity> {
    if (!dto || !dto.username || !dto.email || !dto.password) {
        throw CustomError.badRequest('Username, email and password are required');
    }
    const userData: Omit<UserEntity, 'id' | 'registerDate' | 'followers' | 'following'> = {
        username: dto.username,
        email: dto.email,
        password: BcryptAdapter.hash(dto.password),
        title: dto.title ?? '',
        bannerUrl: dto.bannerUrl ?? '',
        profilePicUrl: dto.profilePicUrl ?? '',
        showcase: dto.showcase ?? [],
        albums: dto.albums ?? [],
        medals: dto.medals ?? [],
        ownedEnglishCards: dto.ownedEnglishCards ?? [],
        ownedJapaneseCards: dto.ownedJapaneseCards ?? [],
        cardsOnSale: dto.cardsOnSale ?? [],
        ownedPokemon: dto.ownedPokemon ?? [],
        favouriteCards: dto.favouriteCards ?? [],
        favouriteSets: dto.favouriteSets ?? [],
        favouritePokemon: dto.favouritePokemon ?? []
    };
    return this.userRepository.create(userData);
  }
}
