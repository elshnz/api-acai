import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MunicipalityService } from './municipality.service';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Municipality')
@Controller('municipality')
export class MunicipalityController {
  constructor(private readonly municipalityService: MunicipalityService) { }

  @Get('all')
  @ApiOperation({ summary: 'Get all municipalities' })
  async findAll() {
    const data = await this.municipalityService.findAll();
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get municipality by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.municipalityService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new municipality (admin)' })
  async create(@Body() dto: CreateMunicipalityDto) {
    return this.municipalityService.create(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a municipality (admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.municipalityService.remove(id);
  }
}
