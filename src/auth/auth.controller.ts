import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignInWithTokenDto } from './dto/sign-in-with-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction = this.configService.get('NODE_ENV') === 'production';
  }

  /**
   * 🔐 SIGN IN Mejorado con HttpOnly Cookie
   * Mantiene compatibilidad: si el cliente lo solicita, envía cookie
   */
  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    // Verificar si el cliente acepta cookies (Feature flag)
    const acceptCookies = req.headers['x-accept-cookies'] === 'true';

    const result = await this.authService.signIn(signInDto);

    if (acceptCookies) {
      // ✅ NUEVO: Enviar token en cookie HttpOnly (más seguro)
      this.setAuthCookie(res, result.accessToken);

      // No devolver el token en el body por seguridad
      return {
        user: result.user,
        message: 'Login successful (cookie-based)',
      };
    }

    // ✅ COMPATIBILIDAD: Para clientes antiguos, devolver token en body
    return result;
  }

  /**
   * 🆕 SIGN IN WITH TOKEN (mejorado con cookies)
   */
  @Public()
  @Post('sign-in-with-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate using token (supports both header and cookie)' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async signInWithToken(
    @Body() dto: SignInWithTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Prioridades: 1. Cookie, 2. Header, 3. Body
    let token: string | undefined;

    // Intentar obtener token de la cookie primero (más seguro)
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // Fallback al header (compatibilidad)
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    // Fallback al body (compatibilidad)
    else if (dto.accessToken) {
      token = dto.accessToken;
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const result = await this.authService.signInWithToken(token);

    // Refrescar la cookie
    this.setAuthCookie(res, result.accessToken);

    // Si vino de cookie, no devolver nuevo token en body
    if (req.cookies?.accessToken) {
      return {
        user: result.user,
        message: 'Session refreshed',
      };
    }

    // Compatibilidad: devolver nuevo token
    return result;
  }

  /**
   * 🆕 LOGOUT - Eliminar cookie
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and clear session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookie(res);
    return { message: 'Logged out successfully' };
  }

  /**
   * 🆕 VERIFY - Verificar si el token actual es válido
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify current session' })
  @ApiResponse({ status: 200, description: 'Session is valid' })
  @ApiResponse({ status: 401, description: 'Session is invalid' })
  async verify(@Req() req: Request) {
    let token: string | undefined;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      throw new UnauthorizedException('No session found');
    }

    const result = await this.authService.verifyToken(token);
    return { valid: true, user: result.user };
  }

  /**
   * 🆕 SET-UP PASSKEY - Iniciar registro de passkey
   */
  @Post('passkey/register/begin')
  @ApiOperation({ summary: 'Begin passkey registration' })
  @ApiResponse({ status: 200, description: 'Registration options generated' })
  async beginPasskeyRegistration(@Req() req: Request) {
    const userId = req.user?.id; // Asumiendo que tienes el usuario en req.user
    if (!userId) throw new UnauthorizedException('User not authenticated');

    return this.authService.beginPasskeyRegistration(userId);
  }

  /**
   * 🆕 COMPLETE PASSKEY - Completar registro de passkey
   */
  @Post('passkey/register/complete')
  @ApiOperation({ summary: 'Complete passkey registration' })
  @ApiResponse({ status: 200, description: 'Passkey registered successfully' })
  async completePasskeyRegistration(
    @Req() req: Request,
    @Body() body: { response: any; challenge: string },
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not authenticated');

    return this.authService.completePasskeyRegistration(userId, body.response, body.challenge);
  }

  /**
   * 🆕 LOGIN WITH PASSKEY - Autenticar con passkey
   */
  @Public()
  @Post('passkey/auth/begin')
  @ApiOperation({ summary: 'Begin passkey authentication' })
  @ApiResponse({ status: 200, description: 'Authentication options generated' })
  async beginPasskeyAuth(@Body() body: { email: string }) {
    return this.authService.beginPasskeyAuthentication(body.email);
  }

  /**
   * 🆕 COMPLETE PASSKEY AUTH - Completar autenticación con passkey
   */
  @Public()
  @Post('passkey/auth/complete')
  @ApiOperation({ summary: 'Complete passkey authentication' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async completePasskeyAuth(
    @Body() body: { email: string; response: any; challenge: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.completePasskeyAuthentication(
      body.email,
      body.response,
      body.challenge,
    );

    // Setear cookie después de autenticación exitosa
    if (result.accessToken) {
      this.setAuthCookie(res, result.accessToken);
    }

    return result;
  }

  // Métodos existentes (sin cambios)
  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body('password') password: string) {
    return this.authService.resetPassword(password);
  }

  // 🔧 Métodos auxiliares privados
  private setAuthCookie(res: Response, token: string): void {
    res.cookie('accessToken', token, {
      httpOnly: true,      // 🔒 Inaccesible para JavaScript
      secure: this.isProduction, // Solo HTTPS en producción
      sameSite: 'strict',   // 🔒 Previene CSRF
      maxAge: 60 * 60 * 1000, // 1 hora
      path: '/',
      domain: this.configService.get('COOKIE_DOMAIN'), // Opcional
    });
  }

  private clearAuthCookie(res: Response): void {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/',
    });
  }
}