import {
  Module,
  Controller,
  Get,
  Post,
  Body,
  Injectable,
  UseGuards,
  Global,
} from '@nestjs/common';
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
import { ApiTags, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { UserModel } from '../user/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../authentication/guards/permissions.guard';
import { Permissions } from '../authentication/decorators/permissions.decorator';
import { BaseModel } from 'src/common/base.entity';

export enum ChangeLogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  SOFT_DELETE = 'SOFT_DELETE',
  HARD_DELETE = 'HARD_DELETE',
  RESTORE = 'RESTORE',
}

export interface CreateChangeLogParams {
  userId: string;
  metaUser?: Record<string, any> | null;
  tableName: string;
  externalId: string;
  action: ChangeLogAction;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
}

@Table({
  tableName: 'change_logs',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class ChangeLogModel extends BaseModel {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataType.UUIDV4,
  })
  declare changelogId: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare userId: string;

  @BelongsTo(() => UserModel)
  declare user: UserModel;

  @Column({ type: DataType.JSONB, allowNull: true })
  metaUser: any;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare tableName: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare externalId: string;

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
  declare action: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  oldValues: any;

  @Column({ type: DataType.JSONB, allowNull: true })
  newValues: any;
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

  async create(data: CreateChangeLogParams): Promise<ChangeLogModel> {
    return await this.changeLogRepository.create(data as any);
  }
}

@ApiTags('change-logs')
@Controller('change-logs')
export class ChangeLogController {
  constructor(private readonly changeLogService: ChangeLogService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('CHANGELOGS.LIST')
  async findAll() {
    return await this.changeLogService.findAll();
  }
}

@Global()
@Module({
  imports: [SequelizeModule.forFeature([ChangeLogModel])],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
  exports: [ChangeLogService],
})
export class ChangeLogModule {}
