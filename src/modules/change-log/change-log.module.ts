import { Module, Controller, Get, Post, Body, Injectable } from '@nestjs/common';
import { InjectModel, SequelizeModule } from '@nestjs/sequelize';
import {
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  Model,
  Table,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ApiTags, ApiProperty } from '@nestjs/swagger';
import { UserModel } from '../user/user.entity';

@Table({
  tableName: 'change_logs',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class ChangeLogModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  changelogId: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: true })
  userId: string;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({ type: DataType.JSONB, allowNull: true })
  metaUser: any;

  @Column({ type: DataType.STRING(50), allowNull: false })
  tableName: string;

  @Column({ type: DataType.UUID, allowNull: false })
  externalId: string;

  @Column({
    type: DataType.ENUM(
      'CREATE',
      'UPDATE',
      'SOFT_DELETE',
      'HARD_DELETE',
      'RESTORE',
    ),
    allowNull: false,
  })
  action: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  oldValues: any;

  @Column({ type: DataType.JSONB, allowNull: true })
  newValues: any;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt?: Date;
}

@Injectable()
export class ChangeLogService {
  constructor(
    @InjectModel(ChangeLogModel)
    private readonly changeLogRepository: typeof ChangeLogModel,
  ) {}

  async findAll(): Promise<ChangeLogModel[]> {
    return await this.changeLogRepository.findAll();
  }

  async create(data: any): Promise<ChangeLogModel> {
    return await this.changeLogRepository.create(data);
  }
}

@ApiTags('change-logs')
@Controller('change-logs')
export class ChangeLogController {
  constructor(private readonly changeLogService: ChangeLogService) {}

  @Get()
  async findAll() {
    return await this.changeLogService.findAll();
  }
}

@Module({
  imports: [SequelizeModule.forFeature([ChangeLogModel])],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
})
export class ChangeLogModule {}
