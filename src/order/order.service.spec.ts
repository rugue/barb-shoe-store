import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let repository: Repository<Order>;

  const mockOrderRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockOrder: Order = {
    id: 1,
    user: null,
    product: null,
    quantity: 2,
    status: 'pending',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      mockOrderRepository.find.mockResolvedValue([mockOrder]);
      const result = await service.findAll();
      expect(result).toEqual([mockOrder]);
      expect(mockOrderRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an order by ID', async () => {
      mockOrderRepository.findOneBy.mockResolvedValue(mockOrder);
      const result = await service.findOne(1);
      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw a NotFoundException if the order is not found', async () => {
      mockOrderRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const createOrderDto: CreateOrderDto = {
        customerId: 1,
        items: [1, 2],
        status: 'pending',
      };
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto);
      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.create).toHaveBeenCalledWith(createOrderDto);
      expect(mockOrderRepository.save).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe('update', () => {
    it('should update an existing order', async () => {
      const updateOrderDto: UpdateOrderDto = {
        status: 'shipped',
        customerId: 1,
        items: [1, 2],
      };
      mockOrderRepository.findOneBy.mockResolvedValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue({
        ...mockOrder,
        ...updateOrderDto,
      });

      const result = await service.update(1, updateOrderDto);
      expect(result).toEqual({ ...mockOrder, ...updateOrderDto });
      expect(mockOrderRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(mockOrderRepository.save).toHaveBeenCalledWith({
        ...mockOrder,
        ...updateOrderDto,
      });
    });

    it('should throw a NotFoundException if the order is not found', async () => {
      mockOrderRepository.findOneBy.mockResolvedValue(null);
      await expect(service.update(1, {} as UpdateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      mockOrderRepository.findOneBy.mockResolvedValue(mockOrder);
      const removeSpy = jest.spyOn(mockOrderRepository, 'remove');

      await service.remove(1);
      expect(removeSpy).toHaveBeenCalledWith(mockOrder);
    });

    it('should throw a NotFoundException if the order is not found', async () => {
      mockOrderRepository.findOneBy.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
