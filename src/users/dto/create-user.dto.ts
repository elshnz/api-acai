import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ example: "Juan Pérez" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "Pérez" })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: "Martinez" })
  @IsString()
  @IsOptional()
  secondLastName?: string;

  @ApiProperty({ example: "juan@acai.gob.mx" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @ApiProperty({ example: "password123", minLength: 6 })
  // @IsString()
  // @MinLength(6)
  // password: string;

  @ApiProperty({ example: "user" })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional({ example: "ACAI" })
  @IsString()
  @IsOptional()
  company?: string;
}
