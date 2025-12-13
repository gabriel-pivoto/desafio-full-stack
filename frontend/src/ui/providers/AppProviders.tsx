import { PropsWithChildren } from 'react';
import { zonesGateway } from '../../infrastructure/zones/zonesGateway';
import { Dependencies, DependenciesContext } from './dependencies';

type Props = PropsWithChildren<{
  dependencies?: Dependencies;
}>;

export function AppProviders({ children, dependencies }: Props) {
  const deps: Dependencies = dependencies || {
    zonesGateway,
  };

  return <DependenciesContext.Provider value={deps}>{children}</DependenciesContext.Provider>;
}
