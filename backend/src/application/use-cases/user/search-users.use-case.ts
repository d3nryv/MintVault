import { UserEntity } from "../../../domain/entities/user.entity";
import { UserRepository } from "../../../domain/repositories/user.repository";

export class SearchUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(query: string): Promise<UserEntity[]> {
        return this.userRepository.search(query);
    }
}
