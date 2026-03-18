import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Inicio' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '/inicio' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  urlInterno?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  showInMenus?: boolean;
}
