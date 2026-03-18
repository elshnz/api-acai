import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoticiaDto {
  @ApiProperty({ example: 'Nueva red de fibra óptica en Jalisco' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'nueva-red-fibra-optica-jalisco' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  meta?: Record<string, any>;
}
