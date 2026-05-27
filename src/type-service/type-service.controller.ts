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
import { TypeServiceService } from './type-service.service';
import { CreateTypeServiceDto } from './dto/create-type-service.dto';
import { UpdateTypeServiceDto } from './dto/update-type-service.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Type Service')
@Controller('typeService')
export class TypeServiceController {
  constructor(private readonly typeServiceService: TypeServiceService) { }

  @Get('all')
  @ApiOperation({ summary: 'Get all type services' })
  async findAll() {
    const data = await this.typeServiceService.findAll();
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get type service by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.typeServiceService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new type service (admin)' })
  async create(@Body() dto: CreateTypeServiceDto) {
    return this.typeServiceService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a type service (admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTypeServiceDto,
  ) {
    return this.typeServiceService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a type service (admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.typeServiceService.remove(id);
  }
}
