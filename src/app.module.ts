import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ChangeLogModule } from './modules/change-log/change-log.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/authentication/authentication.module';
import { CharacterMatchModule } from './modules/character-match/characterMatch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_PATH,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      ...(process.env.DATABASE_URL
        ? {
            uri: process.env.DATABASE_URL,
            dialectOptions: {
              ssl: { require: true, rejectUnauthorized: false },
            },
          }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
          }),
      synchronize: process.env.DB_SYNC === 'true',
      logging: false,
      autoLoadModels: true,
    }),
    AuthModule,
    UserModule,
    RoleModule,
    TransactionModule,
    ChangeLogModule,
    CharacterMatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
