import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt/jwt.estrategy';


@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('PRIVATE_KEY')?.replace(/\\n/g, '\n'), // Carga la clave desde el archivo .env
        signOptions: { expiresIn: '1h' },
      })
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers : [AuthController],
  exports: [AuthService],
})


export class AuthModule {}