export interface CreateUserDto {
    username: string;
    email: string;
    password: string;
    title?: string;
    bannerUrl?: string;
    profilePicUrl?: string;
    showcase?: string[];
    albums?: string[];
    medals?: string[];
    ownedEnglishCards?: string[];
    ownedJapaneseCards?: string[];
    cardsOnSale?: string[];
    ownedPokemon?: string[];
    favouriteCards?: string[];
    favouriteSets?: string[];
    favouritePokemon?: string[];
}

export interface UpdateUserDto {
    username?: string;
    email?: string;
    password?: string;
    title?: string;
    bannerUrl?: string;
    profilePicUrl?: string;
    showcase?: string[];
    albums?: string[];
    followers?: string[];
    following?: string[];
    medals?: string[];
    ownedEnglishCards?: string[];
    ownedJapaneseCards?: string[];
    cardsOnSale?: string[];
    ownedPokemon?: string[];
    favouriteCards?: string[];
    favouriteSets?: string[];
    favouritePokemon?: string[];
}

export interface LoginUserDto {
    username: string;
    password: string;
}
