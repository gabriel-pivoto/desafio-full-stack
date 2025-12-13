import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Zone } from '@/domain/zones/enterprise/entities/zone';
import { ZoneOrmEntity } from '../entities/zone.orm-entity';

export class ZoneMapper {
  static toDomain(entity: ZoneOrmEntity): Zone {
    const zoneOrError = Zone.create(
      {
        name: entity.name,
        type: entity.type,
        geometry: entity.geometry,
        createdAt: entity.createdAt,
      },
      new UniqueEntityID(entity.id),
    );

    if (zoneOrError.isLeft()) {
      throw new Error('Invalid persisted zone data');
    }

    return zoneOrError.value;
  }

  static toPersistence(zone: Zone): ZoneOrmEntity {
    const entity = new ZoneOrmEntity();
    entity.id = zone.id.toString();
    entity.name = zone.name;
    entity.type = zone.type;
    entity.geometry = zone.geometry;
    entity.createdAt = zone.createdAt;
    return entity;
  }
}
