import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({
  tableName: 'user_follows',
  timestamps: true,
  updatedAt: false,
})
export class UserFollowModel extends Model {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare followerId: string;

  @PrimaryKey
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare followingId: string;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;
}
