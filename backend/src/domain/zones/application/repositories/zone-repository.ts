import { Zone } from '@/domain/zones/enterprise/entities/zone';

export const ZONE_REPOSITORY = 'ZONE_REPOSITORY';

export interface ZoneRepository {
  create(zone: Zone): Promise<void>;
  findAll(): Promise<Zone[]>;
  searchByName(name: string): Promise<Zone[]>;
  findById(id: string): Promise<Zone | null>;
}
