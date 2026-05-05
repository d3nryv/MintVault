export class UserEntity {
    
    //Entidad que representa a un usuario en el sistema, con todas 
    // sus propiedades y relaciones con otras entidades.
    constructor(
        public  id: string,
        public  username: string,
        public  title: string,
        public  bannerUrl: string,
        public  profilePicUrl: string,
        public  email: string,
        public  password: string,
        public  showcase: string[],
        public  albums: string[],
        public  followers: string[],
        public  following: string[],
        public  registerDate: Date,
        public  medals: string[],
        public  ownedEnglishCards: string[],
        public  ownedJapaneseCards: string[],
        public  cardsOnSale: string[],
        public  ownedPokemon: string[],
        public  favouriteCards: string[],
        public  favouriteSets: string[],
        public  favouritePokemon: string[],
        public  ownedDecks: string[],
        public  wantList: string[],
        public  cart: string[]
    ) {}
}
