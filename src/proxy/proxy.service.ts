import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    const url = this.configService.get<string>('INTERNAL_API_BASE_URL');
    if (!url) {
      throw new Error('La variable de entorno INTERNAL_API_BASE_URL no está definida');
    }
    return url;
  }

  async forward(method: string, path: string, query: any, body: any) {
    const url = `${this.baseUrl}/${path}`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.request({
          url,
          method: method as any,
          params: query,
          data: body,
        }),
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Error al consumir ${url}: ${axiosError.message}`,
      );

      // Si la API interna respondió con un error, lo propagamos tal cual
      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data ?? 'Error en API interna',
          axiosError.response.status,
        );
      }

      // Si fue timeout, DNS, conexión rechazada, etc.
      throw new HttpException(
        'No se pudo conectar con el servicio interno',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
