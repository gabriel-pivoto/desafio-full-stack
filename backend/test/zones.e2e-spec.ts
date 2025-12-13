import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { HttpExceptionFilter } from '@/infra/http/filters/http-exception.filter';
import { ZoneOrmEntity } from '@/infra/database/typeorm/entities/zone.orm-entity';
import { ZonesModule } from '@/infra/http/modules/zones.module';

describe('Zones e2e (sqlite memory)', () => {
  let app: INestApplication;
  let repo: Repository<ZoneOrmEntity>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [ZoneOrmEntity],
          synchronize: true,
        }),
        ZonesModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    repo = moduleRef.get(getRepositoryToken(ZoneOrmEntity));
  });

  afterEach(async () => {
    await repo.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates and retrieves a zone', async () => {
    const geometry = {
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
    };

    const createResponse = await request(app.getHttpServer())
      .post('/zones')
      .send({
        name: 'Central Park',
        type: 'RESIDENTIAL',
        geometry,
      });

    if (createResponse.status !== 201) {
      // surfaced for easier debugging when database providers change
      // eslint-disable-next-line no-console
      console.error('create zone error', createResponse.body);
    }

    expect(createResponse.status).toBe(201);

    expect(createResponse.body.data.name).toBe('Central Park');
    const zoneId = createResponse.body.data.id;

    const listResponse = await request(app.getHttpServer()).get('/zones').expect(200);
    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].id).toBe(zoneId);

    const byId = await request(app.getHttpServer()).get(`/zones/${zoneId}`).expect(200);
    expect(byId.body.data.name).toBe('Central Park');
  });

  it('searches by name with partial match', async () => {
    await repo.save(
      repo.create({
        id: 'seed-1',
        name: 'Industrial Park',
        type: 'INDUSTRIAL',
        geometry: { type: 'Point', coordinates: [1, 1] },
        createdAt: new Date(),
      }),
    );

    const response = await request(app.getHttpServer()).get('/zones?name=park');
    if (response.status !== 200) {
      // eslint-disable-next-line no-console
      console.error('search zone error', response.body);
    }
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Industrial Park');
  });
});
