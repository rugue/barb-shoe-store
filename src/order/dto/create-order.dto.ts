import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  readonly customerId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  readonly items: number[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly status: string;
}
