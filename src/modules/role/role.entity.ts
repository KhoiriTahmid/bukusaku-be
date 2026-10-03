import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.entity';

@Table({
  tableName: 'roles',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class RoleModel extends BaseModel {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  declare roleId: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare permissions: any;
}
