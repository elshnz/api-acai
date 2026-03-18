import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prospect } from './entities/prospect.entity';

@Injectable()
export class ProspectService {
  constructor(
    @InjectRepository(Prospect)
    private readonly prospectRepository: Repository<Prospect>,
  ) {}

  async addProspect(params: {
    fullName: string;
    phoneNumber: string;
    email: string;
    company: string;
    municipality?: string;
    message?: string;
    idTypeProspect: number;
    idTypeService: number;
  }): Promise<Prospect> {
    const prospect = this.prospectRepository.create(params);
    return this.prospectRepository.save(prospect);
  }

  async findAll(): Promise<Prospect[]> {
    return this.prospectRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Prospect | null> {
    return this.prospectRepository.findOne({ where: { id } });
  }
}
