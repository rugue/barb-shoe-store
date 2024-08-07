import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  create(notification: Notification): Promise<Notification> {
    return this.notificationRepository.save(notification);
  }

  findAll(): Promise<Notification[]> {
    return this.notificationRepository.find();
  }
}
