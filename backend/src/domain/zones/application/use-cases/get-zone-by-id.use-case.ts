import { Either, left, right } from '@/core/either';
import { ZoneRepository } from '@/domain/zones/application/repositories/zone-repository';
import { Zone } from '@/domain/zones/enterprise/entities/zone';
import { ZoneNotFoundError } from './errors/zone-not-found-error';

interface GetZoneByIdUseCaseRequest {
  zoneId: string;
}

export type GetZoneByIdUseCaseResponse = Either<
  ZoneNotFoundError,
  {
    zone: Zone;
  }
>;

export class GetZoneByIdUseCase {
  constructor(private zoneRepository: ZoneRepository) {}

  async execute({
    zoneId,
  }: GetZoneByIdUseCaseRequest): Promise<GetZoneByIdUseCaseResponse> {
    const zone = await this.zoneRepository.findById(zoneId);

    if (!zone) {
      return left(new ZoneNotFoundError(zoneId));
    }

    return right({ zone });
  }
}
