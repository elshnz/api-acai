// grabacion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Licitacion } from './licitacion.entity';

@Entity('grabaciones')
export class Grabacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Licitacion, (lic) => lic.grabaciones, { onDelete: 'CASCADE' })
    licitacion: Licitacion;

    @Column()
    url: string;

    @CreateDateColumn()
    createdAt: Date;
}