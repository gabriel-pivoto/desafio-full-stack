import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ZoneType } from '@/domain/zones/enterprise/entities/zone';

class GeoJSONGeometryDto {
  @ApiProperty({ enum: ['Point', 'Polygon'] })
  @IsNotEmpty()
  @IsString()
  type!: 'Point' | 'Polygon';

  @ApiProperty({
    description: 'GeoJSON coordinates (array for Point or nested arrays for Polygon)',
  })
  @IsArray()
  coordinates!: any[];
}

export class CreateZoneDto {
  @ApiProperty({
    example: 'Central Park',
    description: 'Nome legivel da zona',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    enum: ZoneType,
    example: ZoneType.RESIDENTIAL,
    description: 'Tipo de zona urbana',
  })
  @IsEnum(ZoneType)
  type!: ZoneType;

  @ApiProperty({
    type: GeoJSONGeometryDto,
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
  @ValidateNested()
  @Type(() => GeoJSONGeometryDto)
  geometry!: GeoJSONGeometryDto;
}
