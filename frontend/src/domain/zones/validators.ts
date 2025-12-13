import { CreateZonePayload, GeoJSONGeometry, ZoneType } from './models';
import { assertValidGeometry } from './geojson';

type ValidationResult =
  | { ok: true; value: CreateZonePayload }
  | { ok: false; message: string };

type CreateInput = {
  name: string;
  type: ZoneType;
  geometry: GeoJSONGeometry | null;
};

export function validateCreateZone(input: CreateInput): ValidationResult {
  const name = input.name?.trim();
  if (!name) {
    return { ok: false, message: 'Nome é obrigatório' };
  }

  if (!input.type) {
    return { ok: false, message: 'Tipo é obrigatório' };
  }

  if (!input.geometry) {
    return { ok: false, message: 'Preencha nome, tipo e selecione uma geometria no mapa.' };
  }

  const geometryValidation = assertValidGeometry(input.geometry || undefined);
  if (!geometryValidation.ok) {
    return { ok: false, message: geometryValidation.message };
  }

  return {
    ok: true,
    value: {
      name,
      type: input.type,
      geometry: input.geometry as GeoJSONGeometry,
    },
  };
}
