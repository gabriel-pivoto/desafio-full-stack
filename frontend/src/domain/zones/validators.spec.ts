import { describe, expect, it } from 'vitest';
import { validateCreateZone } from './validators';
import { ZoneType } from './models';

const point = { type: 'Point' as const, coordinates: [1, 2] as [number, number] };
const polygon = {
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

describe('validateCreateZone', () => {
  it('fails when name is empty', () => {
    const result = validateCreateZone({ name: ' ', type: ZoneType.RESIDENTIAL, geometry: point });
    expect(result.ok).toBe(false);
  });

  it('fails when geometry is missing', () => {
    const result = validateCreateZone({ name: 'Zone', type: ZoneType.RESIDENTIAL, geometry: null });
    expect(result.ok).toBe(false);
  });

  it('validates point and trims name', () => {
    const result = validateCreateZone({ name: ' Zone ', type: ZoneType.COMMERCIAL, geometry: point });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('Zone');
      expect(result.value.geometry).toEqual(point);
    }
  });

  it('validates polygon', () => {
    const result = validateCreateZone({ name: 'Poly', type: ZoneType.INDUSTRIAL, geometry: polygon });
    expect(result.ok).toBe(true);
  });
});
