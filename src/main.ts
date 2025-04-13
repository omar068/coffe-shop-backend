import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
    );
    app.enableCors();
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
