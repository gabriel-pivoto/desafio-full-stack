import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Either, left, right } from '@/core/either';
import { ZoneRepository } from '@/domain/zones/application/repositories/zone-repository';
import {
  GeoJSONGeometry,
  Zone,
  ZoneType,
} from '@/domain/zones/enterprise/entities/zone';
import { InvalidZoneError } from '@/domain/zones/enterprise/errors/invalid-zone-error';

export interface CreateZoneUseCaseRequest {
  name: string;
  type: ZoneType;
  geometry: GeoJSONGeometry;
}

export type CreateZoneUseCaseResponse = Either<
  InvalidZoneError,
  {
    zone: Zone;
  }
>;

export class CreateZoneUseCase {
  constructor(private zoneRepository: ZoneRepository) {}

  async execute({
    name,
    type,
    geometry,
  }: CreateZoneUseCaseRequest): Promise<CreateZoneUseCaseResponse> {
    const zoneOrError = Zone.create(
      {
        name,
        type,
        geometry,
      },
      new UniqueEntityID(),
    );

    if (zoneOrError.isLeft()) {
      return left(zoneOrError.value);
    }

    const zone = zoneOrError.value;

    await this.zoneRepository.create(zone);

    return right({ zone });
  }
}
