import httpClient from '../http/httpClient';
import { CreateZonePayload, Zone } from '../../domain/zones/models';
import { ZonesGatewayPort } from '../../application/zones/ports';

type ZonesResponse = { data: Zone[] };
type ZoneResponse = { data: Zone };

export async function listZones(name?: string): Promise<Zone[]> {
  const response = await httpClient.get<ZonesResponse>('/zones', {
    params: name ? { name } : undefined,
  });
  return response.data.data;
}

export async function createZone(payload: CreateZonePayload): Promise<Zone> {
  const response = await httpClient.post<ZoneResponse>('/zones', payload);
  return response.data.data;
}

export async function getZoneById(id: string): Promise<Zone> {
  const response = await httpClient.get<ZoneResponse>(`/zones/${id}`);
  return response.data.data;
}

export const zonesGateway: ZonesGatewayPort = {
  list: listZones,
  create: createZone,
  getById: getZoneById,
};
