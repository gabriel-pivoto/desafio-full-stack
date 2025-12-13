import { CreateZonePayload, Zone } from '../../domain/zones/models';

export interface ZonesGatewayPort {
  list(name?: string): Promise<Zone[]>;
  create(payload: CreateZonePayload): Promise<Zone>;
  getById(id: string): Promise<Zone>;
}
