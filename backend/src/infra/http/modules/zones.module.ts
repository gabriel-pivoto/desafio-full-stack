import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZONE_REPOSITORY, ZoneRepository } from '@/domain/zones/application/repositories/zone-repository';
import { CreateZoneUseCase } from '@/domain/zones/application/use-cases/create-zone.use-case';
import { GetZoneByIdUseCase } from '@/domain/zones/application/use-cases/get-zone-by-id.use-case';
import { ListZonesUseCase } from '@/domain/zones/application/use-cases/list-zones.use-case';
import { SearchZonesByNameUseCase } from '@/domain/zones/application/use-cases/search-zones-by-name.use-case';
import { ZoneOrmEntity } from '@/infra/database/typeorm/entities/zone.orm-entity';
import { TypeOrmZoneRepository } from '@/infra/database/typeorm/repositories/typeorm-zone.repository';
import { ZonesController } from '../controllers/zones.controller';

const useCaseProviders = [
  {
    provide: CreateZoneUseCase,
    useFactory: (zoneRepository: ZoneRepository) =>
      new CreateZoneUseCase(zoneRepository),
    inject: [ZONE_REPOSITORY],
  },
  {
    provide: ListZonesUseCase,
    useFactory: (zoneRepository: ZoneRepository) =>
      new ListZonesUseCase(zoneRepository),
    inject: [ZONE_REPOSITORY],
  },
  {
    provide: SearchZonesByNameUseCase,
    useFactory: (zoneRepository: ZoneRepository) =>
      new SearchZonesByNameUseCase(zoneRepository),
    inject: [ZONE_REPOSITORY],
  },
  {
    provide: GetZoneByIdUseCase,
    useFactory: (zoneRepository: ZoneRepository) =>
      new GetZoneByIdUseCase(zoneRepository),
    inject: [ZONE_REPOSITORY],
  },
];

@Module({
  imports: [TypeOrmModule.forFeature([ZoneOrmEntity])],
  controllers: [ZonesController],
  providers: [
    TypeOrmZoneRepository,
    {
      provide: ZONE_REPOSITORY,
      useExisting: TypeOrmZoneRepository,
    },
    ...useCaseProviders,
  ],
})
export class ZonesModule {}
