import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactFormDto {
    @ApiProperty({ example: 'María García' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser texto' })
    name: string;

    @ApiProperty({ example: 'maria@ejemplo.com' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    @IsEmail({}, { message: 'El email no tiene un formato válido' })
    email: string;

    @ApiProperty({ example: 'Hola, me gustaría más información...' })
    @IsNotEmpty({ message: 'El mensaje es obligatorio' })
    @IsString({ message: 'El mensaje debe ser texto' })
    message: string;

    @ApiProperty({ example: '03AGdBq26...' })
    @IsNotEmpty({ message: 'El token de reCAPTCHA es obligatorio' })
    @IsString()
    recaptchaToken: string;
}