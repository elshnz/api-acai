import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('municipalities')
export class Municipality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
