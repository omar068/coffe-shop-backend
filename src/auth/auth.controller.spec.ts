import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, INestApplication, InternalServerErrorException } from '@nestjs/common';
import * as request from 'supertest';

describe('AuthController', () => {
  let app: INestApplication;
  let authService = {
    register: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    validateRefreshToken: jest.fn(),
    generateAccessToken: jest.fn(),
    getUserById: jest.fn()
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService
        }
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a user successfully', async () => {
      authService.register.mockResolvedValue({ username: 'testuser', message: 'Usuario creado con exito' });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(201)
        .expect({ username: 'testuser', message: 'Usuario creado con exito' });
    });

    it('should throw BadRequestException if user exists', async () => {
      authService.register.mockRejectedValue(new BadRequestException('El usuario ya existe'));

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(400);
    });

    it('should handle internal errors on register', async () => {
      authService.register.mockRejectedValue(new Error('Unexpected error'));

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'errorUser', password: 'testpass' })
        .expect(500);
    });
  });

  describe('POST /auth/login', () => {
    it('should return access token if credentials are valid', async () => {
      authService.validateUser.mockResolvedValue({ id: 1, username: 'testuser' });
      authService.login.mockResolvedValue({
        id: 1,
        username: 'testuser',
        access_token: 'access-token',
        refreshToken: 'refresh-token'
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(201)
        .expect({
          id: 1,
          username: 'testuser',
          access_token: 'access-token',
          refreshToken: 'refresh-token'
        });
    });

    it('should return error message if credentials are invalid', async () => {
      authService.validateUser.mockResolvedValue(false);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'wronguser', password: 'wrongpass' })
        .expect(201)
        .expect({ message: 'Credenciales inválidas' });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token if refresh token is valid', async () => {
      authService.validateRefreshToken.mockResolvedValue(true);
      authService.getUserById.mockResolvedValue({ id: 1, username: 'testuser' });
      authService.generateAccessToken.mockReturnValue('new-access-token');

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ userId: 1, refreshToken: 'refresh-token' })
        .expect(201)
        .expect({ acces_token: 'new-access-token' });
    });

    it('should return 500 if refresh token is invalid', async () => {
      authService.validateRefreshToken.mockResolvedValue(false);

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ userId: 1, refreshToken: 'invalid-token' })
        .expect(500);
    });
  });
});
