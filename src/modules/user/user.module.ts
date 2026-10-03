import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './user.entity';
import { RoleModel } from '../role/role.entity';
import { ChangeLogModule } from '../change-log/change-log.module';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel, RoleModel]),
    ChangeLogModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
