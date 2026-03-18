import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Material')
@Controller('api/rest/v1/material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @ApiOperation({ summary: 'List all educational material' })
  async findAll() {
    return this.materialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get material by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new material (admin)' })
  async create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update material (admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materialService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete material (admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.remove(id);
  }
}
