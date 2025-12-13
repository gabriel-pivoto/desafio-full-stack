import { describe, expect, it } from 'vitest';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Zone, ZoneType } from './zone';
import { InvalidZoneError } from '../errors/invalid-zone-error';

const pointGeometry = { type: 'Point' as const, coordinates: [-10, 20] as [number, number] };
const polygonGeometry = {
  type: 'Polygon' as const,
  coordinates: [
    [
      [-1, 0],
      [-1, 1],
      [0, 1],
      [-1, 0],
    ],
  ],
};

describe('Zone entity', () => {
  it('creates a valid zone and exposes getters', () => {
    const result = Zone.create(
      {
        name: ' Center ',
        type: ZoneType.COMMERCIAL,
        geometry: pointGeometry,
      },
      new UniqueEntityID('zone-id'),
    );

    if (result.isLeft()) throw result.value;

    expect(result.value.id.toString()).toBe('zone-id');
    expect(result.value.name).toBe('Center');
    expect(result.value.type).toBe(ZoneType.COMMERCIAL);
    expect(result.value.geometry).toEqual(pointGeometry);
    expect(result.value.createdAt).toBeInstanceOf(Date);
  });

  it('validates missing or invalid name', () => {
    const emptyName = Zone.create({
      name: '   ',
      type: ZoneType.MIXED,
      geometry: pointGeometry,
    });
    const missingName = Zone.create({
      name: undefined as any,
      type: ZoneType.MIXED,
      geometry: pointGeometry,
    });
    expect(emptyName.isLeft()).toBe(true);
    expect(emptyName.value).toBeInstanceOf(InvalidZoneError);
    expect(missingName.isLeft()).toBe(true);
    expect(missingName.value).toBeInstanceOf(InvalidZoneError);
  });

  it('validates invalid zone type', () => {
    const invalidType = Zone.create({
      name: 'Invalid Type',
      type: 'UNKNOWN' as any,
      geometry: pointGeometry,
    });

    expect(invalidType.isLeft()).toBe(true);
    expect(invalidType.value).toBeInstanceOf(InvalidZoneError);
  });

  it('validates geometry integrity', () => {
    const nullGeometry = Zone.create({
      name: 'Null geometry',
      type: ZoneType.MIXED,
      geometry: null as any,
    });
    const badPoint = Zone.create({
      name: 'Bad point',
      type: ZoneType.RESIDENTIAL,
      geometry: { type: 'Point', coordinates: [1] } as any,
    });
    const badPolygon = Zone.create({
      name: 'Bad polygon',
      type: ZoneType.RESIDENTIAL,
      geometry: { type: 'Polygon', coordinates: [] } as any,
    });
    const nonArrayPolygon = Zone.create({
      name: 'Non array polygon',
      type: ZoneType.RESIDENTIAL,
      geometry: { type: 'Polygon', coordinates: 'invalid' } as any,
    });
    const unknownGeometry = Zone.create({
      name: 'Unknown geometry',
      type: ZoneType.RESIDENTIAL,
      geometry: { type: 'LineString', coordinates: [] } as any,
    });

    [nullGeometry, badPoint, badPolygon, nonArrayPolygon, unknownGeometry].forEach((result) => {
      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(InvalidZoneError);
    });
  });

  it('creates polygon zones and ensures ring closure when already closed', () => {
    const result = Zone.create({
      name: 'Park',
      type: ZoneType.RESIDENTIAL,
      geometry: polygonGeometry,
    });

    if (result.isLeft()) throw result.value;

    expect(result.value.geometry).toEqual(polygonGeometry);
  });

  it('keeps provided createdAt value', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const result = Zone.create({
      name: 'With date',
      type: ZoneType.INDUSTRIAL,
      geometry: pointGeometry,
      createdAt,
    });

    if (result.isLeft()) throw result.value;

    expect(result.value.createdAt).toBe(createdAt);
  });
});
