import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Noticia } from './entities/noticia.entity';
import { CreateNoticiaDto } from './dto/create-noticia.dto';
import { UpdateNoticiaDto } from './dto/update-noticia.dto';

@Injectable()
export class NoticiasService {
  constructor(
    @InjectRepository(Noticia)
    private readonly noticiaRepository: Repository<Noticia>,
  ) {}

  async findAll(): Promise<{ items: Noticia[]; meta: { total_count: number } }> {
    const [items, total] = await this.noticiaRepository.findAndCount({
      where: { status: 'published' },
      order: { createdAt: 'DESC' },
    });
    return { items, meta: { total_count: total } };
  }

  async findOne(id: number): Promise<Noticia> {
    const noticia = await this.noticiaRepository.findOne({ where: { id } });
    if (!noticia) {
      throw new NotFoundException(`Noticia with ID ${id} not found`);
    }
    return noticia;
  }

  async create(dto: CreateNoticiaDto): Promise<Noticia> {
    const noticia = this.noticiaRepository.create(dto);
    return this.noticiaRepository.save(noticia);
  }

  async update(id: number, dto: UpdateNoticiaDto): Promise<Noticia> {
    const noticia = await this.findOne(id);
    Object.assign(noticia, dto);
    return this.noticiaRepository.save(noticia);
  }

  async remove(id: number): Promise<void> {
    const noticia = await this.findOne(id);
    await this.noticiaRepository.remove(noticia);
  }
}
