import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('type_services')
export class TypeService {
  @PrimaryGeneratedColumn()
  idTypeService: number;

  @Column()
  typeService: string;
}
