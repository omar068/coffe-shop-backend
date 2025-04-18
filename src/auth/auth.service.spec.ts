import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockImplementation((user) => user as any);
      userRepository.save.mockResolvedValue({ id: 1, username: 'testuser', password: 'hashedPassword', isActive: true, refreshToken: 'refreshToken' });

      const result = await authService.register('testuser', 'password123');

      expect(result).toEqual({
        username: 'testuser',
        message: 'Usuario creado con exito',
      });
    });

    it('should throw if user already exists', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, username: 'testuser', password: 'hashedPassword', isActive: true, refreshToken: 'refreshToken' });

      await expect(authService.register('testuser', 'password123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return tokens and user info', async () => {
      const mockUser = { id: 1, username: 'user1' };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jwtService.sign
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);

      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedRefreshToken');
      userRepository.update.mockResolvedValue(undefined as any);

      const result = await authService.login(mockUser);

      expect(result).toEqual({
        id: 1,
        username: 'user1',
        access_token: accessToken,
        refreshToken: refreshToken,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user without password if valid', async () => {
      const user = { id: 1, username: 'user1', password: 'hashed' } as any;
      userRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser('user1', 'pass');
      expect(result).toEqual({ id: 1, username: 'user1' });
    });

    it('should return false if not valid', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await authService.validateUser('user1', 'pass');
      expect(result).toBe(false);
    });
  });

  describe('validateRefreshToken', () => {
    it('should return true if valid token', async () => {
      const user = { id: 1, refreshToken: 'hashedToken' } as any;
      userRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateRefreshToken(1, 'hashedToken');
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await authService.validateRefreshToken(1, 'token');
      expect(result).toBe(false);
    });

    it('should return false if tokens do not match', async () => {
      const user = { id: 1, refreshToken: 'hashedToken' } as any;
      userRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await authService.validateRefreshToken(1, 'otherToken');
      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should return signed access token', () => {
      jwtService.sign.mockReturnValue('signed-token');
      const result = authService.generateAccessToken({ username: 'test' });
      expect(result).toBe('signed-token');
    });
  });
});
