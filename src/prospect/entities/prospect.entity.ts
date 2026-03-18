import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('prospects')
export class Prospect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  company: string;

  @Column({ nullable: true })
  municipality: string;

  @Column({ nullable: true, type: 'text' })
  message: string;

  @Column({ default: 1 })
  idTypeProspect: number;

  @Column()
  idTypeService: number;

  @CreateDateColumn()
  createdAt: Date;
}
