import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: Repository<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new notification', async () => {
    const createNotificationDto: CreateNotificationDto = {
      message: 'Test notification',
      title: 'Test title',
    }; // Adjust according to your DTO
    const notification = new Notification();
    Object.assign(notification, createNotificationDto);

    jest.spyOn(repository, 'create').mockReturnValue(notification);
    jest.spyOn(repository, 'save').mockResolvedValue(notification);

    expect(await service.create(createNotificationDto)).toEqual(notification);
    expect(repository.create).toHaveBeenCalledWith(createNotificationDto);
    expect(repository.save).toHaveBeenCalledWith(notification);
  });

  it('should return all notifications', async () => {
    const notifications = [new Notification(), new Notification()];
    jest.spyOn(repository, 'find').mockResolvedValue(notifications);

    expect(await service.findAll()).toEqual(notifications);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should return a notification by ID', async () => {
    const id = 1;
    const notification = new Notification();
    jest.spyOn(repository, 'findOne').mockResolvedValue(notification);

    expect(await service.findOne(id)).toEqual(notification);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
  });

  it('should throw NotFoundException if notification not found', async () => {
    const id = 1;
    jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
  });

  it('should update a notification', async () => {
    const id = 1;
    const updateNotificationDto = { message: 'Updated message' }; // Adjust according to your DTO
    const existingNotification = new Notification();
    jest.spyOn(service, 'findOne').mockResolvedValue(existingNotification);
    jest.spyOn(repository, 'save').mockResolvedValue(existingNotification);

    expect(await service.update(id, updateNotificationDto)).toEqual(
      existingNotification,
    );
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(repository.save).toHaveBeenCalledWith(existingNotification);
  });

  it('should remove a notification', async () => {
    const id = 1;
    const notification = new Notification();
    jest.spyOn(service, 'findOne').mockResolvedValue(notification);
    jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

    await service.remove(id);
    expect(service.findOne).toHaveBeenCalledWith(id);
    expect(repository.remove).toHaveBeenCalledWith(notification);
  });
});
