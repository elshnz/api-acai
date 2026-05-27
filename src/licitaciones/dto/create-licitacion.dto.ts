// dto/create-licitacion.dto.ts
import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { Categoria, TipoConcurrencia } from "../entities/licitacion.entity";

export class CreateDocumentoDto {
  @IsString()
  nombre: string;

  @IsString()
  tipo: string;

  url?: string;
}

export class CreateLicitacionDto {
  @IsString()
  numero: string;

  @IsString()
  concepto: string;

  @IsEnum(Categoria)
  categoria: Categoria;

  @IsEnum(TipoConcurrencia)
  tipoConcurrencia: TipoConcurrencia;

  // @IsOptional()
  @IsDateString()
  fechaPublicacion?: string;

  @IsOptional()
  @IsDateString()
  fechaJuntaAclaratoria?: string;

  @IsOptional()
  @IsDateString()
  fechaPresentacionApertura?: string;

  @IsOptional()
  @IsDateString()
  fechaFallo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentoDto)
  documentos?: CreateDocumentoDto[];
}
