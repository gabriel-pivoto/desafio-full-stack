import { randomUUID } from 'crypto';
import dataSource from './data-source';
import { ZoneType } from '@/domain/zones/enterprise/entities/zone';
import { ZoneOrmEntity } from './typeorm/entities/zone.orm-entity';

async function seed() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(ZoneOrmEntity);

  const count = await repo.count();

  if (count > 0) {
    // eslint-disable-next-line no-console
    console.log('Seed skipped: zones already present');
    await dataSource.destroy();
    return;
  }

  const zones: ZoneOrmEntity[] = [
    repo.create({
      id: randomUUID(),
      name: 'Central Park',
      type: ZoneType.RESIDENTIAL,
      geometry: {
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
      createdAt: new Date(),
    }),
    repo.create({
      id: randomUUID(),
      name: 'Main Station',
      type: ZoneType.COMMERCIAL,
      geometry: {
        type: 'Point',
        coordinates: [-73.991, 40.75],
      },
      createdAt: new Date(),
    }),
  ];

  await repo.save(zones);
  // eslint-disable-next-line no-console
  console.log('Seed completed');
  await dataSource.destroy();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
