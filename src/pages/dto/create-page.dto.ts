import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'Inicio' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'inicio' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({ example: 'page' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  htmlUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  meta?: Record<string, any>;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  showInMenus?: boolean;
}
