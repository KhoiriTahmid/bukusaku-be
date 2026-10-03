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
import { UserModel } from '../user/user.entity';
import { BaseModel } from 'src/common/base.entity';

@Table({
  tableName: 'transactions',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class TransactionModel extends BaseModel {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  declare transactionId: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare userId: string;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @Column({
    type: DataType.ENUM('INCOME', 'EXPENSE'),
    allowNull: false,
  })
  declare type: 'INCOME' | 'EXPENSE';

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare category: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  declare amount: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare transactionDate: Date;
}
