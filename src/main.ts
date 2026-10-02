import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as appJSON from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose', 'log', 'warn', 'error'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle(appJSON.name)
    .setDescription('API Documentation')
    .setVersion(appJSON.version)
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(process.env.SWAGGER_DOCS_PATH ?? 'docs', app, doc);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.info('localhost:' + port);
}
bootstrap();
