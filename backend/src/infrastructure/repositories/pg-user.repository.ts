import { db } from "../database/postgres/database";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserMapper } from "../mappers/user.mapper";

export class PostgresUserRepository extends UserRepository {

    async findAll(): Promise<UserEntity[]> {
        const query = 'SELECT * FROM users';
        const { rows } = await db.query(query);
        return rows.map(row => UserMapper.toEntity(row));
    }

    async findByUsername(username: string): Promise<UserEntity | null> {
        const query = `
            SELECT u.*,
                (SELECT COALESCE(array_agg(id::text), '{}') FROM albums WHERE owner_id = u.id) as real_albums
            FROM users u 
            WHERE username = $1`;
        const { rows } = await db.query(query, [username]);
        
        if (rows.length === 0) return null;
        
        const row = rows[0];
        const realAlbums = row.real_albums || [];
        const storedAlbums = row.albums || [];
        
        if (JSON.stringify(realAlbums.sort()) !== JSON.stringify(storedAlbums.sort())) {
            try {
                await db.query('UPDATE users SET albums = $2 WHERE id = $1', [row.id, realAlbums]);
                row.albums = realAlbums;
            } catch (err) {
                console.error("Failed to self-heal user albums column:", err);
            }
        }
        
        return UserMapper.toEntity(row);
    }
    
    async findById(id: string): Promise<UserEntity | null> {
        const query = `
            SELECT u.*, 
                (SELECT COALESCE(array_agg(id::text), '{}') FROM albums WHERE owner_id = u.id) as real_albums,
                (SELECT COALESCE(array_agg(id), '{}') FROM decks WHERE owner_id = u.id) as owned_decks,
                (SELECT COALESCE(array_agg(id), '{}') FROM sales WHERE seller_id = u.id AND status = 'active') as cards_on_sale,
                (SELECT COALESCE(SUM(t.quantity), 0) FROM transactions t WHERE t.seller_id = u.id AND t.status IN ('shipped', 'completed')) as total_cards_sold,
                (SELECT COUNT(*) FROM transactions t WHERE t.buyer_id = u.id AND t.status = 'completed') as orders_arrived,
                (
                    SELECT COALESCE(array_agg(DISTINCT card_id), '{}') FROM (
                        SELECT unnest(owned_english_cards) as card_id FROM users WHERE id = $1
                        UNION
                        SELECT unnest(owned_japanese_cards) as card_id FROM users WHERE id = $1
                    ) AS all_cards
                ) as all_owned_card_ids
            FROM users u 
            WHERE u.id = $1`;
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        
        const row = rows[0];
        const realAlbums = row.real_albums || [];
        const storedAlbums = row.albums || [];
        
        if (JSON.stringify(realAlbums.sort()) !== JSON.stringify(storedAlbums.sort())) {
            try {
                await db.query('UPDATE users SET albums = $2 WHERE id = $1', [id, realAlbums]);
                row.albums = realAlbums;
            } catch (err) {
                console.error("Failed to self-heal user albums column:", err);
            }
        }
        
        return UserMapper.toEntity(row);
    }
    
    async search(searchTerm: string): Promise<UserEntity[]> {
        const query = `
            SELECT u.*, 
                (SELECT COALESCE(array_agg(id::text), '{}') FROM albums WHERE owner_id = u.id) as real_albums,
                (SELECT COALESCE(array_agg(id), '{}') FROM decks WHERE owner_id = u.id) as owned_decks,
                (SELECT COALESCE(array_agg(id), '{}') FROM sales WHERE seller_id = u.id AND status = 'active') as cards_on_sale,
                (SELECT COALESCE(SUM(t.quantity), 0) FROM transactions t WHERE t.seller_id = u.id AND t.status IN ('shipped', 'completed')) as total_cards_sold,
                (SELECT COUNT(*) FROM transactions t WHERE t.buyer_id = u.id AND t.status = 'completed') as orders_arrived,
                (
                    SELECT COALESCE(array_agg(DISTINCT card_id), '{}') FROM (
                        SELECT unnest(owned_english_cards) as card_id FROM users WHERE id = u.id
                        UNION
                        SELECT unnest(owned_japanese_cards) as card_id FROM users WHERE id = u.id
                    ) AS all_cards
                ) as all_owned_card_ids
            FROM users u 
            WHERE u.username ILIKE $1 OR u.email ILIKE $1`;
        const { rows } = await db.query(query, [`%${searchTerm}%`]);
        
        for (const row of rows) {
            const realAlbums = row.real_albums || [];
            const storedAlbums = row.albums || [];
            if (JSON.stringify(realAlbums.sort()) !== JSON.stringify(storedAlbums.sort())) {
                try {
                    await db.query('UPDATE users SET albums = $2 WHERE id = $1', [row.id, realAlbums]);
                    row.albums = realAlbums;
                } catch (err) {
                    console.error("Failed to self-heal user albums column:", err);
                }
            }
        }
        
        return rows.map(row => UserMapper.toEntity(row));
    }

    async create(user: Omit<UserEntity, 'id' | 'registerDate' | 'followers' | 'following' | 'friendRequests'>): Promise<UserEntity> {
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
        // Send follow request: Add followerId to followed user's friend_requests list
        const query = `
            UPDATE users 
            SET friend_requests = array_append(friend_requests, $1) 
            WHERE id = $2 
            AND NOT ($1 = ANY(friend_requests)) 
            AND NOT ($1 = ANY(followers))`;
        await db.query(query, [followerId, followingId]);
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
            
            // Also remove from friend_requests just in case it was pending
            const queryRequests = `
                UPDATE users 
                SET friend_requests = array_remove(friend_requests, $1) 
                WHERE id = $2`;
            await client.query(queryRequests, [followerId, followingId]);
        });
    }

    async acceptFollowRequest(followerId: string, followingId: string): Promise<void> {
        await db.transactional(async (client) => {
            // Remove followerId from followed user's friend_requests
            const queryRequests = `
                UPDATE users 
                SET friend_requests = array_remove(friend_requests, $1) 
                WHERE id = $2`;
            await client.query(queryRequests, [followerId, followingId]);

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

    async rejectFollowRequest(followerId: string, followingId: string): Promise<void> {
        const query = `
            UPDATE users 
            SET friend_requests = array_remove(friend_requests, $1) 
            WHERE id = $2`;
        await db.query(query, [followerId, followingId]);
    }

    async emptyCart(userId: string): Promise<void> {
        const query = 'UPDATE users SET cart = \'{}\' WHERE id = $1';
        await db.query(query, [userId]);
    }

    async removeVendorItemsFromCart(userId: string, vendorId: string): Promise<void> {
        const query = `
            UPDATE users 
            SET cart = (
                SELECT COALESCE(array_agg(item), '{}')
                FROM unnest(cart) AS item
                LEFT JOIN sales s ON item::uuid = s.id
                WHERE s.seller_id::text != $2 OR s.seller_id IS NULL
            )
            WHERE id = $1`;
        await db.query(query, [userId, vendorId]);
    }
}
