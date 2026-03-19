import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
    @ApiProperty({ example: 'destino@ejemplo.com', description: 'Comma-separated recipient emails' })
    @IsNotEmpty({ message: 'El destinatario es obligatorio' })
    @IsEmail({}, { message: 'El email no tiene un formato válido' })
    toEmail: string;

    @ApiProperty({ example: 'Asunto del correo' })
    @IsNotEmpty({ message: 'El asunto es obligatorio' })
    @IsString({ message: 'El asunto debe ser texto' })
    subject: string;

    @ApiProperty({ example: '<p>Contenido HTML</p>' })
    @IsNotEmpty({ message: 'El contenido es obligatorio' })
    @IsString({ message: 'El contenido debe ser texto' })
    content: string;
}