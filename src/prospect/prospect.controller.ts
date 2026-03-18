import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ProspectService } from './prospect.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Prospect')
@Controller('acaiApi/prospect')
export class ProspectController {
  constructor(private readonly prospectService: ProspectService) {}

  @Post('add')
  @ApiOperation({ summary: 'Add a new prospect (from contact forms)' })
  @ApiQuery({ name: 'fullName', required: true })
  @ApiQuery({ name: 'phoneNumber', required: true })
  @ApiQuery({ name: 'email', required: true })
  @ApiQuery({ name: 'company', required: true })
  @ApiQuery({ name: 'municipality', required: false })
  @ApiQuery({ name: 'message', required: false })
  @ApiQuery({ name: 'idTypeProspect', required: true })
  @ApiQuery({ name: 'idTypeService', required: true })
  async addProspect(
    @Query('fullName') fullName: string,
    @Query('phoneNumber') phoneNumber: string,
    @Query('email') email: string,
    @Query('company') company: string,
    @Query('municipality') municipality: string,
    @Query('message') message: string,
    @Query('idTypeProspect') idTypeProspect: string,
    @Query('idTypeService') idTypeService: string,
  ) {
    return this.prospectService.addProspect({
      fullName,
      phoneNumber,
      email,
      company,
      municipality,
      message,
      idTypeProspect: parseInt(idTypeProspect, 10) || 1,
      idTypeService: parseInt(idTypeService, 10),
    });
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all prospects (admin)' })
  async findAll() {
    const data = await this.prospectService.findAll();
    return { data };
  }
}
