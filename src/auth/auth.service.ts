// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { PasskeyService } from './passkey.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passkeyService: PasskeyService,
  ) { }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // Buscar usuario
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generar token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // No devolver el password
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      user: userWithoutPassword,
    };
  }

  async signInWithToken(token: string) {
    try {
      // Verificar token
      const payload = this.jwtService.verify(token);

      // Obtener usuario actualizado
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generar nuevo token
      const newPayload = { sub: user.id, email: user.email };
      const newAccessToken = this.jwtService.sign(newPayload);

      const { password: _, ...userWithoutPassword } = user;

      return {
        accessToken: newAccessToken,
        user: userWithoutPassword,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async signUp(createUserDto: CreateUserDto) {
    // Tu implementación existente
    return this.usersService.create(createUserDto);
  }

  async forgotPassword(email: string) {
    // Tu implementación existente
  }

  async resetPassword(password: string) {
    // Tu implementación existente
  }

  // 🆕 Métodos para Passkeys
  async beginPasskeyRegistration(userId: string) {
    return this.passkeyService.generateRegistrationOptions(userId);
  }

  async completePasskeyRegistration(userId: string, response: any, challenge: string) {
    const result = await this.passkeyService.verifyRegistration(userId, response, challenge);
    return result;
  }

  async beginPasskeyAuthentication(email: string) {
    return this.passkeyService.generateAuthenticationOptions(email);
  }

  async completePasskeyAuthentication(email: string, response: any, challenge: string) {
    const result = await this.passkeyService.verifyAuthentication(email, response, challenge);

    if (result.verified && result.user) {
      // Generar JWT
      const payload = { sub: result.user.id, email: result.user.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: result.user,
      };
    }

    throw new UnauthorizedException('Passkey authentication failed');
  }
}