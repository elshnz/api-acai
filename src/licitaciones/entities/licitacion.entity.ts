// licitacion.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Documento } from './documento.entity';
import { Grabacion } from './grabaciones.entity';

export enum Categoria {
    LICITACION = 'licitacion',
    DIRECTIVA = 'directiva',
}

export enum TipoConcurrencia {
    CON_CONCURRENCIA = 'con_concurrencia',
    SIN_CONCURRENCIA = 'sin_concurrencia',
    ADJUDICACION_DIRECTA = 'adjudicacion_directa',
}

@Entity('licitaciones')
export class Licitacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    numero: string;

    @Column('text')
    concepto: string;

    @Column({ type: 'enum', enum: Categoria })
    categoria: Categoria;

    @Column({ type: 'enum', enum: TipoConcurrencia })
    tipoConcurrencia: TipoConcurrencia;

    @Column({ type: 'date', nullable: true })
    fechaPublicacion: Date;

    @Column({ type: 'date', nullable: true })
    fechaJuntaAclaratoria: Date;

    @Column({ type: 'date', nullable: true })
    fechaPresentacionApertura: Date;

    @Column({ type: 'date', nullable: true })
    fechaFallo: Date;

    @OneToMany(() => Documento, (doc) => doc.licitacion, { cascade: true })
    documentos: Documento[];

    @OneToMany(() => Grabacion, (grab) => grab.licitacion, { cascade: true })
    grabaciones: Grabacion[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}