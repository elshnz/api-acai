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
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @Get()
  @ApiOperation({ summary: 'Get menu items with optional filters' })
  @ApiQuery({ name: 'show_in_menus', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('show_in_menus') showInMenus?: string,
    @Query('limit') limit?: string,
  ) {
    return this.menuService.findAll({ show_in_menus: showInMenus, limit });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new menu item (admin)' })
  async create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a menu item (admin)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateMenuItemDto>,
  ) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a menu item (admin)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
