import { PartialType } from '@nestjs/swagger';
import { CreateTypeServiceDto } from './create-type-service.dto';

export class UpdateTypeServiceDto extends PartialType(CreateTypeServiceDto) {}
