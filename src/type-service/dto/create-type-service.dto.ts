import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTypeServiceDto {
  @ApiProperty({ example: 'Internet Dedicado' })
  @IsString()
  @IsNotEmpty()
  typeService: string;
}
