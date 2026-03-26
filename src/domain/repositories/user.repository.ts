import { UserEntity } from "../entities/user.entity";

export abstract class UserRepository {
    abstract findAll(): Promise<UserEntity[]>;
    abstract findById(id: string): Promise<UserEntity | null>;
    abstract create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity>;
    abstract update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
    abstract delete(id: string): Promise<void>;
}
