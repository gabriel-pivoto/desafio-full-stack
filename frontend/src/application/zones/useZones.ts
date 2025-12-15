import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CreateZonePayload, Zone } from '../../domain/zones/models';
import { toApiError } from '../../infrastructure/http/apiError';
import { useDependencies } from '../../ui/providers/dependencies';

type UseZonesState = {
  zones: Zone[];
  loading: boolean;
  error: string | null;
  filterName: string;
  setFilterName: (value: string) => void;
  reload: () => Promise<void>;
  create: (payload: CreateZonePayload) => Promise<void>;
};

export function useZones(): UseZonesState {
  const { zonesGateway } = useDependencies();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const requestIdRef = useRef(0);
  const isFirstLoad = useRef(true);

  const trimmedFilter = useMemo(() => filterName.trim(), [filterName]);

  const load = useCallback(
    async (name?: string) => {
      const id = ++requestIdRef.current;
      setLoadingList(true);
      setError(null);
      try {
        const data = await zonesGateway.list(name);
        if (id === requestIdRef.current) {
          setZones(data);
        }
      } catch (err) {
        const apiError = toApiError(err);
        if (id === requestIdRef.current) {
          setError(apiError.message || 'Erro ao carregar zonas');
        }
      } finally {
        if (id === requestIdRef.current) {
          setLoadingList(false);
        }
      }
    },
    [zonesGateway],
  );

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      load(trimmedFilter || undefined);
      return;
    }

    if (creating) {
      return;
    }

    const handle = setTimeout(() => {
      load(trimmedFilter || undefined);
    }, 350);
    return () => clearTimeout(handle);
  }, [trimmedFilter, load, creating]);

  const reload = useCallback(() => load(trimmedFilter || undefined), [load, trimmedFilter]);

  const create = useCallback(
    async (payload: CreateZonePayload) => {
      setCreating(true);
      setError(null);
      try {
        await zonesGateway.create(payload);
        await load(trimmedFilter || undefined);
      } catch (err) {
        const apiError = toApiError(err);
        setError(apiError.message || 'Erro ao criar zona');
        throw apiError;
      } finally {
        setCreating(false);
      }
    },
    [load, trimmedFilter, zonesGateway],
  );

  return {
    zones,
    loading: loadingList || creating,
    error,
    filterName,
    setFilterName,
    reload,
    create,
  };
}
