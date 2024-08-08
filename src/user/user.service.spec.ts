import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const mockUsers = [{ id: 1, username: 'John' }];
    mockUserRepository.find.mockResolvedValue(mockUsers);

    const users = await service.findAll();
    expect(users).toEqual(mockUsers);
  });

  it('should return a user by ID', async () => {
    const mockUser = { id: 1, username: 'John' };
    mockUserRepository.findOne.mockResolvedValue(mockUser);

    const user = await service.findOne(1);
    expect(user).toEqual(mockUser);
  });

  it('should throw NotFoundException if user not found by ID', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should create a new user', async () => {
    const createUserDto = {
      username: 'John',
      email: 'john@example.com',
      password: 'password',
    };
    const mockUser = { id: 1, ...createUserDto };
    mockUserRepository.create.mockReturnValue(mockUser);
    mockUserRepository.save.mockResolvedValue(mockUser);

    const newUser = await service.create(createUserDto);
    expect(newUser).toEqual(mockUser);
  });

  it('should update an existing user', async () => {
    const updateUserDto = { username: 'JohnUpdated' };
    const mockUser = { id: 1, username: 'John' };
    const updatedUser = { id: 1, username: 'JohnUpdated' };

    mockUserRepository.findOne.mockResolvedValue(mockUser);
    mockUserRepository.update.mockResolvedValue(null);
    mockUserRepository.findOne.mockResolvedValue(updatedUser);

    const result = await service.update(1, updateUserDto);
    expect(result).toEqual(updatedUser);
  });

  it('should remove a user by ID', async () => {
    const mockUser = { id: 1, username: 'John' };
    mockUserRepository.findOne.mockResolvedValue(mockUser);
    mockUserRepository.delete.mockResolvedValue(null);

    await service.remove(1);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if user to remove is not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });
});
