import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { ZoneRepository } from '@/domain/zones/application/repositories/zone-repository';
import { Zone } from '@/domain/zones/enterprise/entities/zone';
import { ZoneOrmEntity } from '../entities/zone.orm-entity';
import { ZoneMapper } from '../mappers/zone.mapper';

@Injectable()
export class TypeOrmZoneRepository implements ZoneRepository {
  constructor(
    @InjectRepository(ZoneOrmEntity)
    private readonly repo: Repository<ZoneOrmEntity>,
  ) {}

  async create(zone: Zone): Promise<void> {
    const entity = ZoneMapper.toPersistence(zone);
    await this.repo.save(entity);
  }

  async findAll(): Promise<Zone[]> {
    const entities = await this.repo.find({
      order: { createdAt: 'DESC' },
    });

    return entities.map(ZoneMapper.toDomain);
  }

  async searchByName(name: string): Promise<Zone[]> {
    const connectionType = this.repo.manager.connection.options.type;
    const where =
      connectionType === 'sqlite'
        ? { name: Like(`%${name}%`) }
        : { name: ILike(`%${name}%`) };

    const entities = await this.repo.find({ where, order: { createdAt: 'DESC' } });

    return entities.map(ZoneMapper.toDomain);
  }

  async findById(id: string): Promise<Zone | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ZoneMapper.toDomain(entity) : null;
  }
}
