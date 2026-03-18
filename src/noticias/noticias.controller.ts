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
import { NoticiasService } from './noticias.service';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Noticias')
@Controller('api/rest/v1/noticias')
export class NoticiasController {
  constructor(private readonly noticiasService: NoticiasService) {}

  @Get()
  @ApiOperation({ summary: 'List all published news' })
  async findAll() {
    return this.noticiasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a news article by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.noticiasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new news article (admin)' })
  async create(@Body() dto: CreateNoticiaDto) {
    return this.noticiasService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a news article (admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoticiaDto,
  ) {
    return this.noticiasService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a news article (admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.noticiasService.remove(id);
  }
}
