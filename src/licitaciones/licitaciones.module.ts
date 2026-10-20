// licitaciones.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { Licitacion } from "./entities/licitacion.entity";
import { Documento } from "./entities/documento.entity";
import { Grabacion } from "./entities/grabaciones.entity";
import { LicitacionHistorial } from "./entities/licitacion-historial.entity";
import { LicitacionesService } from "./licitaciones.service";
import { LicitacionesController } from "./licitaciones.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Licitacion, Documento, Grabacion, LicitacionHistorial]),
    // MulterModule.register({ dest: './uploads/licitaciones' }),
  ],
  providers: [LicitacionesService],
  controllers: [LicitacionesController],
})
export class LicitacionesModule {}
