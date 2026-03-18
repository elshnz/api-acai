import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeService } from './entities/type-service.entity';
import { CreateTypeServiceDto } from './dto/create-type-service.dto';
import { UpdateTypeServiceDto } from './dto/update-type-service.dto';

@Injectable()
export class TypeServiceService {
  constructor(
    @InjectRepository(TypeService)
    private readonly typeServiceRepository: Repository<TypeService>,
  ) {}

  async findAll(): Promise<TypeService[]> {
    return this.typeServiceRepository.find();
  }

  async findOne(id: number): Promise<TypeService> {
    const typeService = await this.typeServiceRepository.findOne({
      where: { idTypeService: id },
    });
    if (!typeService) {
      throw new NotFoundException(`TypeService with ID ${id} not found`);
    }
    return typeService;
  }

  async create(dto: CreateTypeServiceDto): Promise<TypeService> {
    const typeService = this.typeServiceRepository.create(dto);
    return this.typeServiceRepository.save(typeService);
  }

  async update(id: number, dto: UpdateTypeServiceDto): Promise<TypeService> {
    const typeService = await this.findOne(id);
    Object.assign(typeService, dto);
    return this.typeServiceRepository.save(typeService);
  }

  async remove(id: number): Promise<void> {
    const typeService = await this.findOne(id);
    await this.typeServiceRepository.remove(typeService);
  }
}
