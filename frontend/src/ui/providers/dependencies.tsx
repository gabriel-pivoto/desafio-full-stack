import { createContext, useContext } from 'react';
import { ZonesGatewayPort } from '../../application/zones/ports';

export type Dependencies = {
  zonesGateway: ZonesGatewayPort;
};

export const DependenciesContext = createContext<Dependencies | null>(null);

export function useDependencies(): Dependencies {
  const deps = useContext(DependenciesContext);
  if (!deps) {
    throw new Error('DependenciesContext not provided. Wrap your tree with <AppProviders>.');
  }
  return deps;
}
