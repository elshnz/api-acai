import { All, Controller, Param, Query, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProxyService } from './proxy.service';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  async proxy(
    @Req() req: Request,
    @Param('0') path: string,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.proxyService.forward(req.method, path, query, body);
  }
}
