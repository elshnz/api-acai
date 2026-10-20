// src/licitaciones/licitaciones.service.ts

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntityManager, Repository } from "typeorm";
import { Licitacion, Categoria, TipoConcurrencia } from "./entities/licitacion.entity";
import { Documento } from "./entities/documento.entity";
import { Grabacion } from "./entities/grabaciones.entity";
import { AccionHistorialLicitacion, LicitacionHistorial } from "./entities/licitacion-historial.entity";
import { CreateLicitacionDto } from "./dto/create-licitacion.dto";
import { UpdateLicitacionDto } from "./dto/update-licitacion.dto";
import * as fs from "fs";
import * as path from "path";
import { ConflictException, HttpException, InternalServerErrorException, Logger } from "@nestjs/common";

type AuditoriaData = {
  usuarioId?: string;
  ipAddress?: string;
};

@Injectable()
export class LicitacionesService {
  private readonly logger = new Logger(LicitacionesService.name);
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Licitacion)
    private readonly licitacionRepo: Repository<Licitacion>,

    @InjectRepository(Documento)
    private readonly documentoRepo: Repository<Documento>,

    @InjectRepository(Grabacion)
    private readonly grabacionRepo: Repository<Grabacion>,

    @InjectRepository(LicitacionHistorial)
    private readonly historialRepo: Repository<LicitacionHistorial>,
  ) {}

  // CREATE
  async create(dto: CreateLicitacionDto, auditoria: AuditoriaData = {}): Promise<Licitacion> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const licitacionRepo = manager.getRepository(Licitacion);

        const licitacion = licitacionRepo.create(dto);
        const licitacionCreada = await licitacionRepo.save(licitacion);

        await this.registrarHistorial(manager, {
          licitacionId: licitacionCreada.id,
          usuarioId: auditoria.usuarioId,
          ipAddress: auditoria.ipAddress,
          accion: AccionHistorialLicitacion.CREATE,
          valoresAnteriores: null,
          valoresNuevos: this.serializarLicitacion(licitacionCreada),
          camposModificados: null,
        });

        return licitacionCreada;
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error.code === "23505") {
        throw new ConflictException(`Ya existe una licitación con ese valor: ${error.detail ?? "campo único duplicado"}`);
      }
      this.logger.error("Error al crear licitación", error.stack);
      throw new InternalServerErrorException("Error al guardar la licitación");
    }
  }

  async findAll(categoria?: Categoria, tipoConcurrencia?: TipoConcurrencia): Promise<Licitacion[]> {
    const where: any = {};

    if (categoria) where.categoria = categoria;
    if (tipoConcurrencia) where.tipoConcurrencia = tipoConcurrencia;

    return this.licitacionRepo.find({
      where,
      relations: ["documentos", "grabaciones"],
      order: { fechaPublicacion: "DESC" },
    });
  }

  async findOne(id: string): Promise<Licitacion> {
    const licitacion = await this.licitacionRepo.findOne({
      where: { id },
      relations: ["documentos", "grabaciones"],
    });

    if (!licitacion) {
      throw new NotFoundException(`Licitación ${id} no encontrada`);
    }

    return licitacion;
  }

  // UPDATE
  async update(id: string, dto: UpdateLicitacionDto, auditoria: AuditoriaData = {}): Promise<Licitacion> {
    return this.dataSource.transaction(async (manager) => {
      const licitacionRepo = manager.getRepository(Licitacion);

      const licitacion = await licitacionRepo.findOne({
        where: { id },
        relations: ["documentos", "grabaciones"],
      });

      if (!licitacion) {
        throw new NotFoundException(`Licitación ${id} no encontrada`);
      }

      // Solo auditamos propiedades que llegaron en el DTO.
      // Así no guardamos todos los campos sin necesidad.
      const valoresAnteriores = this.obtenerValoresParaAuditoria(licitacion, dto);

      Object.assign(licitacion, dto);

      const licitacionActualizada = await licitacionRepo.save(licitacion);

      const valoresNuevos = this.obtenerValoresParaAuditoria(licitacionActualizada, dto);

      const camposModificados = this.obtenerCambios(valoresAnteriores, valoresNuevos);

      // No crees una entrada de historial si el PATCH no cambió nada.
      if (Object.keys(camposModificados).length > 0) {
        await this.registrarHistorial(manager, {
          licitacionId: id,
          usuarioId: auditoria.usuarioId,
          ipAddress: auditoria.ipAddress,
          accion: AccionHistorialLicitacion.UPDATE,
          valoresAnteriores,
          valoresNuevos,
          camposModificados,
        });
      }

      return licitacionActualizada;
    });
  }

  // Actualizar nombre de un documento
  async updateDocumentoNombre(documentoId: string, nombre: string, auditoria: AuditoriaData = {}): Promise<Documento> {
    return this.dataSource.transaction(async (manager) => {
      const documentoRepo = manager.getRepository(Documento);

      const documento = await documentoRepo.findOne({
        where: { id: documentoId },
        relations: ["licitacion"],
      });

      if (!documento) {
        throw new NotFoundException("Documento no encontrado");
      }

      const valoresAnteriores = {
        nombre: documento.nombre,
      };

      documento.nombre = nombre;

      const documentoActualizado = await documentoRepo.save(documento);

      const valoresNuevos = {
        nombre: documentoActualizado.nombre,
      };

      const camposModificados = this.obtenerCambios(valoresAnteriores, valoresNuevos);

      if (Object.keys(camposModificados).length > 0) {
        await this.registrarHistorial(manager, {
          licitacionId: documento.licitacion.id,
          usuarioId: auditoria.usuarioId,
          ipAddress: auditoria.ipAddress,
          accion: AccionHistorialLicitacion.DOCUMENT_UPDATE,
          valoresAnteriores,
          valoresNuevos,
          camposModificados,
        });
      }

      return documentoActualizado;
    });
  }

  // DELETE LICITACIÓN
  async remove(id: string, auditoria: AuditoriaData = {}): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const licitacionRepo = manager.getRepository(Licitacion);

      const licitacion = await licitacionRepo.findOne({
        where: { id },
        relations: ["documentos", "grabaciones"],
      });

      if (!licitacion) {
        throw new NotFoundException(`Licitación ${id} no encontrada`);
      }

      const snapshot = this.serializarLicitacion(licitacion);

      await this.registrarHistorial(manager, {
        licitacionId: id,
        usuarioId: auditoria.usuarioId,
        ipAddress: auditoria.ipAddress,
        accion: AccionHistorialLicitacion.DELETE,
        valoresAnteriores: snapshot,
        valoresNuevos: null,
        camposModificados: null,
      });

      // Borrado lógico: marca deletedAt, no elimina la fila
      await licitacionRepo.softDelete(id);
    });

    // IMPORTANTE: ya no se eliminan archivos físicos
  }

  // BÚSQUEDA
  async buscar(termino: string, categoria?: Categoria, tipoConcurrencia?: TipoConcurrencia): Promise<Licitacion[]> {
    const query = this.licitacionRepo
      .createQueryBuilder("lic")
      .leftJoinAndSelect("lic.documentos", "doc")
      .leftJoinAndSelect("lic.grabaciones", "grab")
      .where("lic.numero ILIKE :termino OR lic.concepto ILIKE :termino", {
        termino: `%${termino}%`,
      });

    if (categoria) {
      query.andWhere("lic.categoria = :categoria", { categoria });
    }

    if (tipoConcurrencia) {
      query.andWhere("lic.tipoConcurrencia = :tipoConcurrencia", {
        tipoConcurrencia,
      });
    }

    return query.orderBy("lic.fechaPublicacion", "DESC").getMany();
  }

  // SUBIR DOCUMENTO
  async addDocumento(id: string, file: any, nombre: string, tipo: string, auditoria: AuditoriaData = {}): Promise<Documento> {
    return this.dataSource.transaction(async (manager) => {
      const licitacionRepo = manager.getRepository(Licitacion);
      const documentoRepo = manager.getRepository(Documento);

      const licitacion = await licitacionRepo.findOne({
        where: { id },
      });

      if (!licitacion) {
        throw new NotFoundException(`Licitación ${id} no encontrada`);
      }

      const documento = documentoRepo.create({
        nombre,
        tipo,
        url: file.path,
        licitacion,
      });

      const documentoCreado = await documentoRepo.save(documento);

      await this.registrarHistorial(manager, {
        licitacionId: id,
        usuarioId: auditoria.usuarioId,
        ipAddress: auditoria.ipAddress,
        accion: AccionHistorialLicitacion.DOCUMENT_CREATE,
        valoresAnteriores: null,
        valoresNuevos: {
          documentoId: documentoCreado.id,
          nombre: documentoCreado.nombre,
          tipo: documentoCreado.tipo,
          url: documentoCreado.url,
        },
        camposModificados: null,
      });

      return documentoCreado;
    });
  }

  // ELIMINAR DOCUMENTO
  async removeDocumento(documentoId: string, auditoria: AuditoriaData = {}): Promise<void> {
    const archivoAEliminar = await this.dataSource.transaction(async (manager) => {
      const documentoRepo = manager.getRepository(Documento);

      const documento = await documentoRepo.findOne({
        where: { id: documentoId },
        relations: ["licitacion"],
      });

      if (!documento) {
        throw new NotFoundException("Documento no encontrado");
      }

      await this.registrarHistorial(manager, {
        licitacionId: documento.licitacion.id,
        usuarioId: auditoria.usuarioId,
        ipAddress: auditoria.ipAddress,
        accion: AccionHistorialLicitacion.DOCUMENT_DELETE,
        valoresAnteriores: {
          documentoId: documento.id,
          nombre: documento.nombre,
          tipo: documento.tipo,
          url: documento.url,
        },
        valoresNuevos: null,
        camposModificados: null,
      });

      const url = documento.url;
      await documentoRepo.remove(documento);

      return url;
    });

    if (archivoAEliminar) {
      this.deleteFile(archivoAEliminar);
    }
  }

  // AGREGAR GRABACIÓN
  async addGrabacion(id: string, file?: any, url?: string, auditoria: AuditoriaData = {}): Promise<Grabacion> {
    return this.dataSource.transaction(async (manager) => {
      const licitacionRepo = manager.getRepository(Licitacion);
      const grabacionRepo = manager.getRepository(Grabacion);

      const licitacion = await licitacionRepo.findOne({
        where: { id },
      });

      if (!licitacion) {
        throw new NotFoundException(`Licitación ${id} no encontrada`);
      }

      const grabacion = grabacionRepo.create({
        url: file ? file.path : url,
        licitacion,
      });

      const grabacionCreada = await grabacionRepo.save(grabacion);

      await this.registrarHistorial(manager, {
        licitacionId: id,
        usuarioId: auditoria.usuarioId,
        ipAddress: auditoria.ipAddress,
        accion: AccionHistorialLicitacion.GRABACION_CREATE,
        valoresAnteriores: null,
        valoresNuevos: {
          grabacionId: grabacionCreada.id,
          url: grabacionCreada.url,
        },
        camposModificados: null,
      });

      return grabacionCreada;
    });
  }

  // CONSULTAR HISTORIAL DE UNA LICITACIÓN
  async findHistorial(id: string): Promise<LicitacionHistorial[]> {
    await this.findOne(id);

    return this.historialRepo
      .createQueryBuilder("h")
      .leftJoin("h.usuario", "u")
      .addSelect(["u.id", "u.email", "u.name", "u.lastName", "u.secondLastName", "u.role"])
      .where("h.licitacionId = :id", { id })
      .orderBy("h.createdAt", "DESC")
      .getMany();
  }

  // Crea una fila de auditoría usando el manager transaccional.
  private async registrarHistorial(
    manager: EntityManager,
    data: {
      licitacionId: string;
      usuarioId?: string;
      ipAddress?: string;
      accion: AccionHistorialLicitacion;
      valoresAnteriores?: Record<string, unknown> | null;
      valoresNuevos?: Record<string, unknown> | null;
      camposModificados?: Record<string, unknown> | null;
    },
  ): Promise<void> {
    const historialRepo = manager.getRepository(LicitacionHistorial);

    const historial = historialRepo.create({
      licitacionId: data.licitacionId,
      usuarioId: data.usuarioId ?? null,
      ipAddress: data.ipAddress ?? null,
      accion: data.accion,
      valoresAnteriores: data.valoresAnteriores ?? null,
      valoresNuevos: data.valoresNuevos ?? null,
      camposModificados: data.camposModificados ?? null,
    });

    await historialRepo.save(historial);
  }

  private obtenerValoresParaAuditoria(entidad: Licitacion, dto: UpdateLicitacionDto): Record<string, unknown> {
    const resultado: Record<string, unknown> = {};

    const entidadComoRegistro = entidad as unknown as Record<string, unknown>;

    for (const campo of Object.keys(dto)) {
      resultado[campo] = entidadComoRegistro[campo];
    }

    return resultado;
  }

  private obtenerCambios(
    valoresAnteriores: Record<string, unknown>,
    valoresNuevos: Record<string, unknown>,
  ): Record<string, { anterior: unknown; nuevo: unknown }> {
    const cambios: Record<string, { anterior: unknown; nuevo: unknown }> = {};

    for (const campo of Object.keys(valoresNuevos)) {
      const anterior = valoresAnteriores[campo];
      const nuevo = valoresNuevos[campo];

      if (JSON.stringify(anterior) !== JSON.stringify(nuevo)) {
        cambios[campo] = {
          anterior,
          nuevo,
        };
      }
    }

    return cambios;
  }

  private serializarLicitacion(licitacion: Licitacion): Record<string, unknown> {
    const { documentos, grabaciones, ...datosLicitacion } = licitacion;

    return {
      ...datosLicitacion,

      documentos: (documentos ?? []).map((documento) => ({
        id: documento.id,
        nombre: documento.nombre,
        tipo: documento.tipo,
        url: documento.url,
      })),

      grabaciones: (grabaciones ?? []).map((grabacion) => ({
        id: grabacion.id,
        url: grabacion.url,
      })),
    };
  }

  private deleteFile(filePath: string): void {
    const fullPath = path.resolve(filePath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
