export type GeoJSONPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon;

export enum ZoneType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MIXED = 'MIXED',
}

export type Zone = {
  id: string;
  name: string;
  type: ZoneType;
  geometry: GeoJSONGeometry;
  createdAt: string;
};

export type CreateZonePayload = {
  name: string;
  type: ZoneType;
  geometry: GeoJSONGeometry;
};
