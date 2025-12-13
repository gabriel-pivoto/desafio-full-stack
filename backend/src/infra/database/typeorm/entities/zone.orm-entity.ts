import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { GeoJSONGeometry, ZoneType } from '@/domain/zones/enterprise/entities/zone';

const geometryColumnType: 'jsonb' | 'simple-json' =
  process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb';
const zoneTypeColumn =
  process.env.NODE_ENV === 'test'
    ? ({ type: 'text' } as const)
    : ({ type: 'enum', enum: ZoneType } as const);

@Entity({ name: 'zones' })
export class ZoneOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column(zoneTypeColumn)
  type!: ZoneType;

  @Column({
    type: geometryColumnType,
  })
  geometry!: GeoJSONGeometry;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
