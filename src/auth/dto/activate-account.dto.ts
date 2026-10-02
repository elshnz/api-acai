// auth/dto/activate-account.dto.ts
import { IsUUID, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ActivateAccountDto {
  @ApiProperty({ example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" })
  @IsUUID()
  uid: string;

  @ApiProperty({ example: "a1b2c3d4..." })
  @IsString()
  token: string;

  @ApiProperty({ example: "MiPassword123!", minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
