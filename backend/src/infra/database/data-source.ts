import { DataSource } from 'typeorm';
import { join } from 'path';
import '@/config/load-env';
import { ZoneOrmEntity } from '@/infra/database/typeorm/entities/zone.orm-entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'zones',
  entities: [ZoneOrmEntity],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
});

export default dataSource;
