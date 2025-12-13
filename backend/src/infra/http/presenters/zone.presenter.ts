import { ApiProperty } from '@nestjs/swagger';
import { Zone } from '@/domain/zones/enterprise/entities/zone';

export class ZonePresenter {
  @ApiProperty({ example: 'b9f0ac89-2c0c-4f9f-bb6d-8f46f7b2c5f1' })
  id!: string;

  @ApiProperty({ example: 'Central Park' })
  name!: string;

  @ApiProperty({ example: 'RESIDENTIAL' })
  type!: string;

  @ApiProperty({
    example: {
      type: 'Polygon',
      coordinates: [
        [
          [-73.97, 40.77],
          [-73.98, 40.78],
          [-73.99, 40.77],
          [-73.97, 40.76],
          [-73.97, 40.77],
        ],
      ],
    },
  })
  geometry!: unknown;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  static toHttp(zone: Zone) {
    return {
      id: zone.id.toString(),
      name: zone.name,
      type: zone.type,
      geometry: zone.geometry,
      createdAt: zone.createdAt,
    };
  }
}
