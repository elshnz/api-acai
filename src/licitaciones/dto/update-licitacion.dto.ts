// dto/update-licitacion.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLicitacionDto } from './create-licitacion.dto';

export class UpdateLicitacionDto extends PartialType(CreateLicitacionDto) { }