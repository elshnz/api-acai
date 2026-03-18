import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async findAll(query: {
    show_in_menus?: string;
    limit?: string;
    type?: string;
  }): Promise<{ items: Page[]; meta: { total_count: number } }> {
    const qb = this.pageRepository.createQueryBuilder('page');

    if (query.show_in_menus === 'true') {
      qb.andWhere('page.showInMenus = :showInMenus', { showInMenus: true });
    }

    if (query.type) {
      qb.andWhere('page.type = :type', { type: query.type });
    }

    const limit = query.limit ? parseInt(query.limit, 10) : 100;
    qb.take(limit);
    qb.orderBy('page.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: { total_count: total },
    };
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return page;
  }

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { slug } });
    if (!page) {
      throw new NotFoundException(`Page with slug "${slug}" not found`);
    }
    return page;
  }

  async create(dto: CreatePageDto): Promise<Page> {
    const page = this.pageRepository.create(dto);
    return this.pageRepository.save(page);
  }

  async update(id: number, dto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);
    Object.assign(page, dto);
    return this.pageRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    await this.pageRepository.remove(page);
  }
}
