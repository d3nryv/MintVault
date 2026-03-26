import { Table, Column, Model, DataType, PrimaryKey, Default, AllowNull, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class UserModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare username: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare title: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare bannerUrl: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare profilePicUrl: string | null;

  @Column({
    type: DataType.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  // showcase -> array of showcase IDs (UUID)
  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare showcase: string[];

  // albums -> array of album IDs (UUID)
  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare albums: string[];

  // followers/following stored as arrays of UUIDs for convenience; you can replace with a join table (recommended)
  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare followers: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare following: string[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare registerDate: Date;

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare medals: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare ownedEnglishCards: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare ownedJapaneseCards: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare cardsOnSale: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare ownedPokemon: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare favouriteCards: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare favouriteSets: string[];

  @Default([])
  @Column({
    type: DataType.ARRAY(DataType.UUID),
    allowNull: false,
  })
  declare favouritePokemon: string[];
}
