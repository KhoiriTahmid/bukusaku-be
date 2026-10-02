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

@Table({
  tableName: 'transactions',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class TransactionModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  transactionId: string;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({
    type: DataType.ENUM('INCOME', 'EXPENSE'),
    allowNull: false,
  })
  type: 'INCOME' | 'EXPENSE';

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  category: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  transactionDate: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;
}
