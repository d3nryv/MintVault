import { UserEntity } from "../entities/user.entity";

export abstract class UserRepository {
    abstract findAll(): Promise<UserEntity[]>;
    abstract findById(id: string): Promise<UserEntity | null>;
    abstract findByUsername(username: string): Promise<UserEntity | null>;
    abstract search(query: string): Promise<UserEntity[]>;
    abstract create(user: Omit<UserEntity, 'id' | 'registerDate' | 'followers' | 'following' | 'friendRequests'>): Promise<UserEntity>;
    abstract update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
    abstract delete(id: string): Promise<void>;
    abstract follow(followerId: string, followingId: string): Promise<void>;
    abstract unfollow(followerId: string, followingId: string): Promise<void>;
    abstract acceptFollowRequest(followerId: string, followingId: string): Promise<void>;
    abstract rejectFollowRequest(followerId: string, followingId: string): Promise<void>;
    abstract emptyCart(userId: string): Promise<void>;
    abstract removeVendorItemsFromCart(userId: string, vendorId: string): Promise<void>;
}
