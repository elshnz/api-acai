import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class HireEmailDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    company: string;

    @IsString()
    @IsOptional()
    service?: string;

    @IsNumber()
    @IsNotEmpty()
    municipality: number;

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsOptional()
    message?: string;
}