import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Pages')
@Controller('api/rest/v1/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'List pages with optional filters' })
  @ApiQuery({ name: 'show_in_menus', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('show_in_menus') showInMenus?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.pagesService.findAll({
      show_in_menus: showInMenus,
      limit,
      type,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a page by ID' })
  async findOne(@Param('id') id: string) {
    // Support both numeric ID and slug
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      return this.pagesService.findOne(numericId);
    }
    return this.pagesService.findBySlug(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new page (admin)' })
  async create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a page (admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a page (admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.remove(id);
  }
}
