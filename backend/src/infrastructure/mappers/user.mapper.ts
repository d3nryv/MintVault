import { UserEntity } from "../../domain/entities/user.entity";

export class UserMapper {

    static toEntity(row: any): UserEntity {
        if (!row) throw new Error('User not found');
        
        return new UserEntity(
            row.id,
            row.username,
            row.title,
            row.banner_url || null,
            row.profile_pic_url || null,
            row.email,
            row.password,
            row.showcase || [],
            row.albums || [],
            row.followers || [],
            row.following || [],
            row.register_date,
            row.medals || [],
            row.owned_english_cards || [],
            row.owned_japanese_cards || [],
            row.cards_on_sale || [],
            row.owned_pokemon || [],
            row.favourite_cards || [],
            row.favourite_sets || [],
            row.favourite_pokemon || [],
            row.owned_decks || [],
            row.want_list || []
        );
    }

    static toDatabase(user: Partial<UserEntity>): any {
        const dbFields: any = {};
        
        if (user.id !== undefined) dbFields.id = user.id;
        if (user.username !== undefined) dbFields.username = user.username;
        if (user.title !== undefined) dbFields.title = user.title;
        if (user.bannerUrl !== undefined) dbFields.banner_url = user.bannerUrl;
        if (user.profilePicUrl !== undefined) dbFields.profile_pic_url = user.profilePicUrl;
        if (user.email !== undefined) dbFields.email = user.email;
        if (user.password !== undefined) dbFields.password = user.password;
        if (user.showcase !== undefined) dbFields.showcase = user.showcase;
        if (user.albums !== undefined) dbFields.albums = user.albums;
        if (user.followers !== undefined) dbFields.followers = user.followers;
        if (user.following !== undefined) dbFields.following = user.following;
        if (user.registerDate !== undefined) dbFields.register_date = user.registerDate;
        if (user.medals !== undefined) dbFields.medals = user.medals;
        if (user.ownedEnglishCards !== undefined) dbFields.owned_english_cards = user.ownedEnglishCards;
        if (user.ownedJapaneseCards !== undefined) dbFields.owned_japanese_cards = user.ownedJapaneseCards;
        if (user.cardsOnSale !== undefined) dbFields.cards_on_sale = user.cardsOnSale;
        if (user.ownedPokemon !== undefined) dbFields.owned_pokemon = user.ownedPokemon;
        if (user.favouriteCards !== undefined) dbFields.favourite_cards = user.favouriteCards;
        if (user.favouriteSets !== undefined) dbFields.favourite_sets = user.favouriteSets;
        if (user.favouritePokemon !== undefined) dbFields.favourite_pokemon = user.favouritePokemon;
        if (user.ownedDecks !== undefined) dbFields.owned_decks = user.ownedDecks;
        if (user.wantList !== undefined) dbFields.want_list = user.wantList;
        
        return dbFields;
    }
}
