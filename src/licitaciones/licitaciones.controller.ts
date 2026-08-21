// licitaciones.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { LicitacionesService } from "./licitaciones.service";
import { CreateLicitacionDto } from "./dto/create-licitacion.dto";
import { UpdateLicitacionDto } from "./dto/update-licitacion.dto";
import { Categoria, TipoConcurrencia } from "./entities/licitacion.entity";
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

@ApiTags("Licitaciones")
@Controller("licitaciones")
export class LicitacionesController {
  constructor(private readonly service: LicitacionesService) {}

  @Post()
  create(@Body() dto: CreateLicitacionDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query("categoria") categoria?: Categoria,
    @Query("tipo") tipoConcurrencia?: TipoConcurrencia,
  ) {
    return this.service.findAll(categoria, tipoConcurrencia);
  }

  @Get("buscar")
  buscar(
    @Query("q") termino: string,
    @Query("categoria") categoria?: Categoria,
    @Query("tipo") tipoConcurrencia?: TipoConcurrencia,
  ) {
    return this.service.buscar(termino, categoria, tipoConcurrencia);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateLicitacionDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post(":id/documentos")
  @UseInterceptors(FileInterceptor("file", { storage }))
  addDocumento(
    @Param("id") id: string,
    @UploadedFile() file: any,
    @Body("nombre") nombre: string,
    @Body("tipo") tipo: string,
  ) {
    return this.service.addDocumento(id, file, nombre, tipo);
  }

  @Delete("documentos/:documentoId")
  removeDocumento(@Param("documentoId") documentoId: string) {
    return this.service.removeDocumento(documentoId);
  }

  // @Post(':id/grabaciones')
  // @UseInterceptors(FileInterceptor('file', { storage }))
  // addGrabacion(
  //     @Param('id') id: string,
  //     @UploadedFile() file: any,
  // ) {
  //     return this.service.addGrabacion(id, file);
  // }
  //
  @Post(":id/grabaciones")
  @UseInterceptors(FileInterceptor("file", { storage }))
  addGrabacion(
    @Param("id") id: string,
    @UploadedFile() file?: any,
    @Body("url") url?: string,
  ) {
    return this.service.addGrabacion(id, file, url);
  }
}
