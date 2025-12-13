import { Entity } from '@/core/entities/entity';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/either';
import { InvalidZoneError } from '../errors/invalid-zone-error';

export enum ZoneType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MIXED = 'MIXED',
}

export type GeoJSONPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon;

export interface ZoneProps {
  name: string;
  type: ZoneType;
  geometry: GeoJSONGeometry;
  createdAt?: Date;
}

export class Zone extends Entity<ZoneProps> {
  private constructor(props: ZoneProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: ZoneProps,
    id?: UniqueEntityID,
  ): Either<InvalidZoneError, Zone> {
    const trimmedName = props.name?.trim();
    if (!trimmedName) {
      return left(new InvalidZoneError('Zone name is required'));
    }

    if (!Object.values(ZoneType).includes(props.type)) {
      return left(new InvalidZoneError('Invalid zone type'));
    }

    if (!Zone.isValidGeometry(props.geometry)) {
      return left(new InvalidZoneError('Invalid GeoJSON geometry'));
    }

    const zone = new Zone(
      { ...props, name: trimmedName, createdAt: props.createdAt ?? new Date() },
      id,
    );
    return right(zone);
  }

  get name(): string {
    return this.props.name;
  }

  get type(): ZoneType {
    return this.props.type;
  }

  get geometry(): GeoJSONGeometry {
    return this.props.geometry;
  }

  get createdAt(): Date {
    return this.props.createdAt as Date;
  }

  private static isValidGeometry(geometry: GeoJSONGeometry): boolean {
    if (!geometry || typeof geometry !== 'object') {
      return false;
    }

    if (geometry.type === 'Point') {
      const coords = geometry.coordinates;
      return (
        Array.isArray(coords) &&
        coords.length === 2 &&
        coords.every((coordinate) => typeof coordinate === 'number')
      );
    }

    if (geometry.type === 'Polygon') {
      const { coordinates } = geometry;

      if (
        !Array.isArray(coordinates) ||
        coordinates.length === 0 ||
        !coordinates.every(
          (ring) =>
            Array.isArray(ring) &&
            ring.length >= 4 &&
            ring.every(
              (point) =>
                Array.isArray(point) &&
                point.length === 2 &&
                point.every((coordinate) => typeof coordinate === 'number'),
            ),
        )
      ) {
        return false;
      }

      return true;
    }

    return false;
  }
}
