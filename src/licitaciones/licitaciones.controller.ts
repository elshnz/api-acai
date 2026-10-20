import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UploadedFile, UseInterceptors, UseGuards } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { LicitacionesService } from "./licitaciones.service";
import { CreateLicitacionDto } from "./dto/create-licitacion.dto";
import { UpdateLicitacionDto } from "./dto/update-licitacion.dto";
import { Categoria, TipoConcurrencia } from "./entities/licitacion.entity";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { Auditoria } from "@/common/decorators/auditoria.decorator";

import { ApiTags } from "@nestjs/swagger";
import { existsSync, mkdirSync } from "fs";
import { extname } from "path";

const storage = diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadPath = "./uploads/licitaciones";
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = extname(file.originalname);
    const nombre = file.originalname
      .replace(ext, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-]/g, "")
      .toLowerCase();
    const timestamp = Date.now();
    cb(null, `${nombre}-${timestamp}${ext}`);
  },
});

type AuditoriaData = { usuarioId?: string; ipAddress?: string };

// @ApiTags("Licitaciones")
// @Controller("licitaciones")
// export class LicitacionesController {
//   constructor(private readonly service: LicitacionesService) { }

@ApiTags("Licitaciones")
@UseGuards(JwtAuthGuard)
@Controller("licitaciones")
export class LicitacionesController {
  constructor(private readonly service: LicitacionesService) {}

  @Post()
  create(@Body() dto: CreateLicitacionDto, @Auditoria() auditoria: AuditoriaData) {
    return this.service.create(dto, auditoria);
  }

  // @Post()
  // create(@Body() dto: CreateLicitacionDto) {
  //   return this.service.create(dto);
  // }

  @Get()
  findAll(@Query("categoria") categoria?: Categoria, @Query("tipo") tipoConcurrencia?: TipoConcurrencia) {
    return this.service.findAll(categoria, tipoConcurrencia);
  }

  @Get("buscar")
  buscar(@Query("q") termino: string, @Query("categoria") categoria?: Categoria, @Query("tipo") tipoConcurrencia?: TipoConcurrencia) {
    return this.service.buscar(termino, categoria, tipoConcurrencia);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() dto: UpdateLicitacionDto) {
  //   return this.service.update(id, dto);
  // }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateLicitacionDto, @Auditoria() auditoria: AuditoriaData) {
    return this.service.update(id, dto, auditoria);
  }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.service.remove(id);
  // }
  @Delete(":id")
  remove(@Param("id") id: string, @Auditoria() auditoria: AuditoriaData) {
    return this.service.remove(id, auditoria);
  }

  // @Post(":id/documentos")
  // @UseInterceptors(FileInterceptor("file", { storage }))
  // addDocumento(@Param("id") id: string, @UploadedFile() file: any, @Body("nombre") nombre: string, @Body("tipo") tipo: string) {
  //   return this.service.addDocumento(id, file, nombre, tipo);
  // }

  // @Patch("documentos/:documentoId")
  // updateDocumentoNombre(@Param("documentoId") documentoId: string, @Body("nombre") nombre: string) {
  //   return this.service.updateDocumentoNombre(documentoId, nombre);
  // }

  // @Delete("documentos/:documentoId")
  // removeDocumento(@Param("documentoId") documentoId: string) {
  //   return this.service.removeDocumento(documentoId);
  // }

  // @Post(":id/grabaciones")
  // @UseInterceptors(FileInterceptor("file", { storage }))
  // addGrabacion(@Param("id") id: string, @UploadedFile() file?: any, @Body("url") url?: string) {
  //   return this.service.addGrabacion(id, file, url);
  // }
  // history
  // @Get(":id/historial")
  // async obtenerHistorial(@Param("id") id: string) {
  //   return this.service.findHistorial(id);
  // }
  //
  @Post(":id/documentos")
  @UseInterceptors(FileInterceptor("file", { storage }))
  addDocumento(
    @Param("id") id: string,
    @UploadedFile() file: any,
    @Body("nombre") nombre: string,
    @Body("tipo") tipo: string,
    @Auditoria() auditoria: AuditoriaData,
  ) {
    return this.service.addDocumento(id, file, nombre, tipo, auditoria);
  }

  @Patch("documentos/:documentoId")
  updateDocumentoNombre(@Param("documentoId") documentoId: string, @Body("nombre") nombre: string, @Auditoria() auditoria: AuditoriaData) {
    return this.service.updateDocumentoNombre(documentoId, nombre, auditoria);
  }

  @Delete("documentos/:documentoId")
  removeDocumento(@Param("documentoId") documentoId: string, @Auditoria() auditoria: AuditoriaData) {
    return this.service.removeDocumento(documentoId, auditoria);
  }

  @Post(":id/grabaciones")
  @UseInterceptors(FileInterceptor("file", { storage }))
  addGrabacion(@Param("id") id: string, @UploadedFile() file: any, @Body("url") url: string, @Auditoria() auditoria: AuditoriaData) {
    return this.service.addGrabacion(id, file, url, auditoria);
  }

  @Get(":id/historial")
  obtenerHistorial(@Param("id") id: string) {
    return this.service.findHistorial(id);
  }
}
