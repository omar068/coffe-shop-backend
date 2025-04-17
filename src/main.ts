import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
    );
    app.useGlobalPipes(new ValidationPipe({
      transform: true, 
    }));
    app.enableCors();
  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
