import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import '@/config/load-env';
import { ZoneOrmEntity } from '@/infra/database/typeorm/entities/zone.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'zones',
        entities: [ZoneOrmEntity, join(__dirname, '/**/*.orm-entity{.ts,.js}')],
        migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
        synchronize: false,
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
