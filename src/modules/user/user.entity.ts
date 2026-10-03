import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { RoleModel } from '../role/role.entity';
import { BaseModel } from 'src/common/base.entity';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class UserModel extends BaseModel {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  declare userId: string;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare roleId: string;

  @BelongsTo(() => RoleModel)
  declare role: RoleModel;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare refreshToken: string | null;
}
