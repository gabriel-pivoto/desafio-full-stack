import { GeoJSONGeometry, GeoJSONPoint, GeoJSONPolygon } from './models';

type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export const isPoint = (geometry: GeoJSONGeometry | null | undefined): geometry is GeoJSONPoint =>
  !!geometry && geometry.type === 'Point';

export const isPolygon = (geometry: GeoJSONGeometry | null | undefined): geometry is GeoJSONPolygon =>
  !!geometry && geometry.type === 'Polygon';

export function assertValidGeometry(geometry: GeoJSONGeometry | null | undefined): ValidationResult {
  if (!geometry || typeof geometry !== 'object') {
    return { ok: false, message: 'Geometria obrigatória' };
  }

  if (isPoint(geometry)) {
    const coords = geometry.coordinates;
    if (Array.isArray(coords) && coords.length === 2 && coords.every((n) => typeof n === 'number')) {
      return { ok: true };
    }
    return { ok: false, message: 'Point inválido' };
  }

  if (isPolygon(geometry)) {
    const { coordinates } = geometry;
    const isValidRing =
      Array.isArray(coordinates) &&
      coordinates.length > 0 &&
      coordinates.every(
        (ring) =>
          Array.isArray(ring) &&
          ring.length >= 4 &&
          ring.every(
            (pt) =>
              Array.isArray(pt) &&
              pt.length === 2 &&
              pt.every((n) => typeof n === 'number'),
          ),
      );
    if (!isValidRing) {
      return { ok: false, message: 'Polygon inválido' };
    }
    return { ok: true };
  }

  return { ok: false, message: 'Tipo de geometria inválido' };
}

type LatLng = { lat: number; lng: number };

export function circleToPolygon(center: LatLng, radius: number, sides = 32): GeoJSONPolygon {
  const coords: [number, number][] = [];
  const earth = 6378137;
  const latRad = (center.lat * Math.PI) / 180;

  for (let i = 0; i <= sides; i += 1) {
    const angle = (i / sides) * 2 * Math.PI;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    const dLat = (dy / earth) * (180 / Math.PI);
    const dLng = (dx / (earth * Math.cos(latRad))) * (180 / Math.PI);
    coords.push([center.lng + dLng, center.lat + dLat]);
  }

  return { type: 'Polygon', coordinates: [coords] };
}
