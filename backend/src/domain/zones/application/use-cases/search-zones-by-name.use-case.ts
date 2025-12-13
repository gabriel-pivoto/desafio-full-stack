import { Either, right } from '@/core/either';
import { ZoneRepository } from '@/domain/zones/application/repositories/zone-repository';
import { Zone } from '@/domain/zones/enterprise/entities/zone';

interface SearchZonesByNameUseCaseRequest {
  name: string;
}

type SearchZonesByNameUseCaseResponse = Either<
  null,
  {
    zones: Zone[];
  }
>;

export class SearchZonesByNameUseCase {
  constructor(private zoneRepository: ZoneRepository) {}

  async execute({
    name,
  }: SearchZonesByNameUseCaseRequest): Promise<SearchZonesByNameUseCaseResponse> {
    const zones = await this.zoneRepository.searchByName(name);
    return right({ zones });
  }
}
