import { beforeEach, describe, expect, it } from 'vitest';
import { ZoneRepository } from '@/domain/zones/application/repositories/zone-repository';
import { CreateZoneUseCase } from '@/domain/zones/application/use-cases/create-zone.use-case';
import { GetZoneByIdUseCase } from '@/domain/zones/application/use-cases/get-zone-by-id.use-case';
import { ListZonesUseCase } from '@/domain/zones/application/use-cases/list-zones.use-case';
import { SearchZonesByNameUseCase } from '@/domain/zones/application/use-cases/search-zones-by-name.use-case';
import { InvalidZoneError } from '@/domain/zones/enterprise/errors/invalid-zone-error';
import { Zone, ZoneType } from '@/domain/zones/enterprise/entities/zone';

class InMemoryZoneRepository implements ZoneRepository {
  public zones: Zone[] = [];

  async create(zone: Zone): Promise<void> {
    this.zones.push(zone);
  }

  async findAll(): Promise<Zone[]> {
    return this.zones;
  }

  async searchByName(name: string): Promise<Zone[]> {
    return this.zones.filter((zone) =>
      zone.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  async findById(id: string): Promise<Zone | null> {
    return this.zones.find((zone) => zone.id.toString() === id) ?? null;
  }
}

describe('Zone Use Cases (domain layer)', () => {
  let repository: InMemoryZoneRepository;
  let createZone: CreateZoneUseCase;
  let listZones: ListZonesUseCase;
  let searchZones: SearchZonesByNameUseCase;
  let getZoneById: GetZoneByIdUseCase;

  beforeEach(() => {
    repository = new InMemoryZoneRepository();
    createZone = new CreateZoneUseCase(repository);
    listZones = new ListZonesUseCase(repository);
    searchZones = new SearchZonesByNameUseCase(repository);
    getZoneById = new GetZoneByIdUseCase(repository);
  });

  it('creates a zone with a valid Point geometry', async () => {
    const result = await createZone.execute({
      name: 'Station',
      type: ZoneType.COMMERCIAL,
      geometry: { type: 'Point', coordinates: [-46.5, -23.5] },
    });

    expect(result.isRight()).toBe(true);
    if (result.isLeft()) throw result.value;

    expect(result.value.zone.geometry.type).toBe('Point');
    expect(repository.zones).toHaveLength(1);
  });

  it('creates a zone with a valid Polygon geometry', async () => {
    const result = await createZone.execute({
      name: 'Park',
      type: ZoneType.RESIDENTIAL,
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-46.6, -23.6],
            [-46.61, -23.6],
            [-46.61, -23.61],
            [-46.6, -23.61],
            [-46.6, -23.6],
          ],
        ],
      },
    });

    expect(result.isRight()).toBe(true);
    if (result.isLeft()) throw result.value;

    expect(result.value.zone.geometry.type).toBe('Polygon');
  });

  it('rejects invalid GeoJSON geometry', async () => {
    const result = await createZone.execute({
      name: 'Invalid',
      type: ZoneType.MIXED,
      geometry: { type: 'Polygon', coordinates: [] },
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidZoneError);
  });

  it('filters by name', async () => {
    await createZone.execute({
      name: 'Industrial Area',
      type: ZoneType.INDUSTRIAL,
      geometry: { type: 'Point', coordinates: [0, 0] },
    });
    await createZone.execute({
      name: 'Residential Park',
      type: ZoneType.RESIDENTIAL,
      geometry: { type: 'Point', coordinates: [1, 1] },
    });

    const searchResult = await searchZones.execute({ name: 'park' });
    expect(searchResult.isRight()).toBe(true);
    if (searchResult.isLeft()) throw searchResult.value;

    expect(searchResult.value.zones).toHaveLength(1);
    expect(searchResult.value.zones[0].name).toBe('Residential Park');

    const listResult = await listZones.execute();
    expect(listResult.isRight()).toBe(true);
    if (listResult.isLeft()) throw listResult.value;

    expect(listResult.value.zones).toHaveLength(2);
  });

  it('gets zone by id', async () => {
    const creation = await createZone.execute({
      name: 'Industrial Area',
      type: ZoneType.INDUSTRIAL,
      geometry: { type: 'Point', coordinates: [0, 0] },
    });
    if (creation.isLeft()) throw creation.value;

    const result = await getZoneById.execute({ zoneId: creation.value.zone.id.toString() });

    expect(result.isRight()).toBe(true);
    if (result.isLeft()) throw result.value;

    expect(result.value.zone.name).toBe('Industrial Area');
  });

  it('returns error when zone id does not exist', async () => {
    const result = await getZoneById.execute({ zoneId: 'missing-id' });

    expect(result.isLeft()).toBe(true);
  });
});
