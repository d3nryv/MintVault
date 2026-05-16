import { db } from "../database/postgres/database";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserMapper } from "../mappers/user.mapper";

export class PostgresUserRepository implements UserRepository {

    async findAll(): Promise<UserEntity[]> {
        const query = 'SELECT * FROM users';
        const { rows } = await db.query(query);
        return rows.map(row => UserMapper.toEntity(row));
    }

    async findById(id: string): Promise<UserEntity | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        return UserMapper.toEntity(rows[0]);
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        const query = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(query, [username]);
        
        if (rows.length === 0) return null;
        return UserMapper.toEntity(rows[0]);
    }

    async create(user: Omit<UserEntity, 'id' | 'registerDate' | 'followers' | 'following'>): Promise<UserEntity> {
        const dbData = UserMapper.toDatabase(user);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
            INSERT INTO users (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *`;
        
        const { rows } = await db.query(query, values);
        return UserMapper.toEntity(rows[0]);
    }

    async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
        const dbData = UserMapper.toDatabase(user);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('User not found');
            return existing;
        }

        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        const query = `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`;
        
        const { rows } = await db.query(query, [id, ...values]);
        if (rows.length === 0) throw new Error('User not found');
        return UserMapper.toEntity(rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM users WHERE id = $1';
        await db.query(query, [id]);
    }

    async follow(followerId: string, followingId: string): Promise<void> {
        await db.transactional(async (client) => {
            // Add followingId to follower's following list
            const queryFollowing = `
                UPDATE users 
                SET following = array_append(following, $2) 
                WHERE id = $1 AND NOT ($2 = ANY(following))`;
            await client.query(queryFollowing, [followerId, followingId]);

            // Add followerId to followed user's followers list
            const queryFollowers = `
                UPDATE users 
                SET followers = array_append(followers, $1) 
                WHERE id = $2 AND NOT ($1 = ANY(followers))`;
            await client.query(queryFollowers, [followerId, followingId]);
        });
    }

    async unfollow(followerId: string, followingId: string): Promise<void> {
        await db.transactional(async (client) => {
            // Remove followingId from follower's following list
            const queryFollowing = `
                UPDATE users 
                SET following = array_remove(following, $2) 
                WHERE id = $1`;
            await client.query(queryFollowing, [followerId, followingId]);

            // Remove followerId from followed user's followers list
            const queryFollowers = `
                UPDATE users 
                SET followers = array_remove(followers, $1) 
                WHERE id = $2`;
            await client.query(queryFollowers, [followerId, followingId]);
        });
    }
}
