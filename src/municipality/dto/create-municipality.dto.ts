import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMunicipalityDto {
  @ApiProperty({ example: 'Guadalajara' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
