import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async findAll(query: {
    show_in_menus?: string;
    limit?: string;
  }): Promise<{ items: MenuItem[]; meta: { total_count: number } }> {
    const qb = this.menuItemRepository.createQueryBuilder('menu');

    if (query.show_in_menus === 'true') {
      qb.andWhere('menu.showInMenus = :show', { show: true });
    }

    qb.andWhere('menu.isActive = :active', { active: true });
    qb.orderBy('menu.order', 'ASC');

    const limit = query.limit ? parseInt(query.limit, 10) : 998;
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: { total_count: total },
    };
  }

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const menuItem = this.menuItemRepository.create(dto);
    return this.menuItemRepository.save(menuItem);
  }

  async update(id: number, dto: Partial<CreateMenuItemDto>): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id } });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    Object.assign(menuItem, dto);
    return this.menuItemRepository.save(menuItem);
  }

  async remove(id: number): Promise<void> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id } });
    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }
    await this.menuItemRepository.remove(menuItem);
  }
}
