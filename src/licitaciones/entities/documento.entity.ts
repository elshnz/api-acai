// documento.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Licitacion } from './licitacion.entity';

@Entity('documentos')
export class Documento {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Licitacion, (lic) => lic.documentos, { onDelete: 'CASCADE' })
    licitacion: Licitacion;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    url: string;

    @Column({ nullable: true })
    tipo: string;

    @CreateDateColumn()
    createdAt: Date;
}