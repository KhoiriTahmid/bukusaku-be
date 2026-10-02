import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './user.entity';
import { RoleModel } from '../role/role.entity';

@Module({
  imports: [SequelizeModule.forFeature([UserModel, RoleModel])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
