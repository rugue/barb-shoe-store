import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  message: string;

  @Column({ default: false })
  read: boolean;
}
