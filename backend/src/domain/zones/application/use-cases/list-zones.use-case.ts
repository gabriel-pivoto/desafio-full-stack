import { Either, right } from '@/core/either';
import { ZoneRepository } from '@/domain/zones/application/repositories/zone-repository';
import { Zone } from '@/domain/zones/enterprise/entities/zone';

type ListZonesUseCaseResponse = Either<
  null,
  {
    zones: Zone[];
  }
>;

export class ListZonesUseCase {
  constructor(private zoneRepository: ZoneRepository) {}

  async execute(): Promise<ListZonesUseCaseResponse> {
    const zones = await this.zoneRepository.findAll();
    return right({ zones });
  }
}
