// licitaciones.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Licitacion, Categoria, TipoConcurrencia } from './entities/licitacion.entity';
import { Documento } from './entities/documento.entity';
import { Grabacion } from './entities/grabaciones.entity';
import { CreateLicitacionDto } from './dto/create-licitacion.dto';
import { UpdateLicitacionDto } from './dto/update-licitacion.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LicitacionesService {
    constructor(
        @InjectRepository(Licitacion)
        private readonly licitacionRepo: Repository<Licitacion>,
        @InjectRepository(Documento)
        private readonly documentoRepo: Repository<Documento>,
        @InjectRepository(Grabacion)
        private readonly grabacionRepo: Repository<Grabacion>,
    ) { }

    // CREATE
    async create(dto: CreateLicitacionDto): Promise<Licitacion> {
        const licitacion = this.licitacionRepo.create(dto);
        return this.licitacionRepo.save(licitacion);
    }

    // READ ALL — filtrar por categoria y/o tipoConcurrencia
    async findAll(categoria?: Categoria, tipoConcurrencia?: TipoConcurrencia): Promise<Licitacion[]> {
        const where: any = {};
        if (categoria) where.categoria = categoria;
        if (tipoConcurrencia) where.tipoConcurrencia = tipoConcurrencia;

        return this.licitacionRepo.find({
            where,
            relations: ['documentos', 'grabaciones'],
            order: { fechaPublicacion: 'DESC' },
        });
    }

    // READ ONE
    async findOne(id: string): Promise<Licitacion> {
        const licitacion = await this.licitacionRepo.findOne({
            where: { id },
            relations: ['documentos', 'grabaciones'],
        });
        if (!licitacion) throw new NotFoundException(`Licitación ${id} no encontrada`);
        return licitacion;
    }

    // UPDATE
    async update(id: string, dto: UpdateLicitacionDto): Promise<Licitacion> {
        const licitacion = await this.findOne(id);
        Object.assign(licitacion, dto);
        return this.licitacionRepo.save(licitacion);
    }

    // DELETE
    async remove(id: string): Promise<void> {
        const licitacion = await this.findOne(id);
        for (const doc of licitacion.documentos) {
            if (doc.url) this.deleteFile(doc.url);
        }
        for (const grab of licitacion.grabaciones) {
            if (grab.url) this.deleteFile(grab.url);
        }
        await this.licitacionRepo.remove(licitacion);
    }

    // BÚSQUEDA
    async buscar(termino: string, categoria?: Categoria, tipoConcurrencia?: TipoConcurrencia): Promise<Licitacion[]> {
        const query = this.licitacionRepo.createQueryBuilder('lic')
            .leftJoinAndSelect('lic.documentos', 'doc')
            .leftJoinAndSelect('lic.grabaciones', 'grab')
            .where('lic.numero ILIKE :termino OR lic.concepto ILIKE :termino', {
                termino: `%${termino}%`,
            });

        if (categoria) {
            query.andWhere('lic.categoria = :categoria', { categoria });
        }
        if (tipoConcurrencia) {
            query.andWhere('lic.tipoConcurrencia = :tipoConcurrencia', { tipoConcurrencia });
        }

        return query.orderBy('lic.fechaPublicacion', 'DESC').getMany();
    }

    // SUBIR DOCUMENTO
    async addDocumento(id: string, file: any, nombre: string, tipo: string): Promise<Documento> {
        const licitacion = await this.findOne(id);
        const documento = this.documentoRepo.create({
            nombre,
            tipo,
            url: file.path,
            licitacion,
        });
        return this.documentoRepo.save(documento);
    }

    // ELIMINAR DOCUMENTO
    async removeDocumento(documentoId: string): Promise<void> {
        const documento = await this.documentoRepo.findOne({ where: { id: documentoId } });
        if (!documento) throw new NotFoundException('Documento no encontrado');
        if (documento.url) this.deleteFile(documento.url);
        await this.documentoRepo.remove(documento);
    }

    // SUBIR GRABACIÓN
    async addGrabacion(id: string, file: any): Promise<Grabacion> {
        const licitacion = await this.findOne(id);
        const grabacion = this.grabacionRepo.create({ url: file.path, licitacion });
        return this.grabacionRepo.save(grabacion);
    }

    private deleteFile(filePath: string) {
        const fullPath = path.resolve(filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
}