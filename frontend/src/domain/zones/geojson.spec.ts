import { describe, expect, it } from 'vitest';
import { assertValidGeometry, circleToPolygon, isPoint, isPolygon } from './geojson';

describe('geojson helpers', () => {
  it('validates point', () => {
    const geom = { type: 'Point' as const, coordinates: [1, 2] as [number, number] };
    expect(isPoint(geom)).toBe(true);
    expect(assertValidGeometry(geom).ok).toBe(true);
  });

  it('validates polygon', () => {
    const geom = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    };
    expect(isPolygon(geom)).toBe(true);
    expect(assertValidGeometry(geom).ok).toBe(true);
  });

  it('rejects invalid geometry', () => {
    expect(assertValidGeometry(null).ok).toBe(false);
    expect(assertValidGeometry({ type: 'Point', coordinates: [1] } as any).ok).toBe(false);
  });

  it('converts circle to polygon with closed ring', () => {
    const polygon = circleToPolygon({ lat: 0, lng: 0 }, 10, 8);
    expect(polygon.type).toBe('Polygon');
    expect(polygon.coordinates[0].length).toBe(9);
    const first = polygon.coordinates[0][0];
    const last = polygon.coordinates[0][polygon.coordinates[0].length - 1];
    expect(first[0]).toBeCloseTo(last[0]);
    expect(first[1]).toBeCloseTo(last[1]);
  });
});
