// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasskeyService } from './passkey.service';
import { UsersModule } from '../users/users.module';
import { Passkey } from './entities/passkey.entity';
import { WebauthnChallenge } from './entities/webauth-challenge.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Registrar las entidades de passkeys en TypeORM
    TypeOrmModule.forFeature([Passkey, WebauthnChallenge]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h')
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasskeyService],
  exports: [AuthService, PasskeyService],
})
export class AuthModule { }