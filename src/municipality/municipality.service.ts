import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipality } from './entities/municipality.entity';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';

@Injectable()
export class MunicipalityService {
  constructor(
    @InjectRepository(Municipality)
    private readonly municipalityRepository: Repository<Municipality>,
  ) {}

  async findAll(): Promise<Municipality[]> {
    return this.municipalityRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Municipality> {
    const municipality = await this.municipalityRepository.findOne({
      where: { id },
    });
    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${id} not found`);
    }
    return municipality;
  }

  async create(dto: CreateMunicipalityDto): Promise<Municipality> {
    const municipality = this.municipalityRepository.create(dto);
    return this.municipalityRepository.save(municipality);
  }

  async remove(id: number): Promise<void> {
    const municipality = await this.findOne(id);
    await this.municipalityRepository.remove(municipality);
  }
}
