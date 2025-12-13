import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateZonesTable1700000000000 implements MigrationInterface {
  name = 'CreateZonesTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "zones_type_enum" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED')
    `);

    await queryRunner.query(`
      CREATE TABLE "zones" (
        "id" uuid PRIMARY KEY,
        "name" varchar NOT NULL,
        "type" "zones_type_enum" NOT NULL,
        "geometry" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "zones"');
    await queryRunner.query('DROP TYPE "zones_type_enum"');
  }
}
