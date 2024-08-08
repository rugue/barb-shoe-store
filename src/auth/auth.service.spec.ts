import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if username exists', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue({
        id: 1,
        username: 'existingUser',
        email: 'existing@example.com',
        password: 'hashedPassword',
        role: 'user',
      } as User);

      await expect(
        authService.register({
          username: 'test',
          email: 'test@example.com',
          password: 'password',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should return access token and message when user is registered', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userService, 'create').mockResolvedValue({
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      } as User);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');

      const result = await authService.register({
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        message: 'User created successfully',
        access_token: 'access_token',
        data: { username: 'test', sub: 1 },
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if credentials are invalid', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

      await expect(
        authService.login({ username: 'test', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token and message when credentials are valid', async () => {
      const user = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      } as User;

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');

      const result = await authService.login({
        username: 'test',
        password: 'password',
      });

      expect(result).toEqual({
        message: 'Login successful',
        access_token: 'access_token',
        data: { username: 'test', sub: 1 },
      });
    });
  });
});
