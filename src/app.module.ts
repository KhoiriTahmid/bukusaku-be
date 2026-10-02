import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ChangeLogModule } from './modules/change-log/change-log.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_PATH,
    }),
    SequelizeModule.forRoot({
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      synchronize: false,
      logging: false,
      autoLoadModels: true,
    }),
    UserModule,
    RoleModule,
    TransactionModule,
    ChangeLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
