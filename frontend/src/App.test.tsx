import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProviders } from './ui/providers/AppProviders';
import { ZonesPage } from './ui/pages/ZonesPage';
import { Dependencies } from './ui/providers/dependencies';

const listZonesMock = vi.fn();
const createZoneMock = vi.fn();

const mapViewSpy = vi.fn();

vi.mock('./ui/components/map/MapView', () => ({
  MapView: (props: any) => {
    mapViewSpy(props);
    return (
      <div>
        <div data-testid="selected-geometry">
          {props.selectedGeometry ? props.selectedGeometry.type : 'none'}
        </div>
        <button onClick={() => props.onGeometryChange({ type: 'Point', coordinates: [3, 4] })}>
          select-geometry
        </button>
        <button onClick={() => props.setDrawMode('polygon')}>set-polygon</button>
        <div>Map mock</div>
      </div>
    );
  },
}));

describe('App', () => {
  const dependencies: Dependencies = {
    zonesGateway: {
      list: (...args: any[]) => listZonesMock(...args),
      create: (...args: any[]) => createZoneMock(...args),
      getById: vi.fn(),
    },
  };

  const renderApp = () =>
    render(
      <AppProviders dependencies={dependencies}>
        <ZonesPage />
      </AppProviders>,
    );

  beforeEach(() => {
    listZonesMock.mockResolvedValue([]);
    createZoneMock.mockResolvedValue({
      id: '1',
      name: 'Mock',
      type: 'RESIDENTIAL',
      geometry: { type: 'Point', coordinates: [0, 0] },
      createdAt: new Date().toISOString(),
    });
    mapViewSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('shows loading and then renders', async () => {
    let resolvePromise: (value: any) => void = () => {};
    listZonesMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    renderApp();

    expect(screen.getByText(/Carregando zonas/i)).toBeInTheDocument();

    await act(async () => {
      resolvePromise([]);
    });

    await waitFor(() => expect(screen.queryByText(/Carregando zonas/i)).not.toBeInTheDocument());
    expect(listZonesMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Nova Zona/i)).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    listZonesMock.mockRejectedValueOnce(new Error('Falhou'));

    renderApp();

    expect(await screen.findByText(/Falhou/)).toBeInTheDocument();
  });

  it('uses fallback error message when fetch fails without message', async () => {
    listZonesMock.mockRejectedValueOnce({});

    renderApp();

    expect(await screen.findByText(/Erro ao carregar zonas/)).toBeInTheDocument();
  });

  it('shows validation error when geometry is missing', async () => {
    renderApp();

    fireEvent.click(screen.getByText(/Nova Zona/i));
    await userEvent.type(screen.getByLabelText('Nome'), 'Zone without geometry');
    await userEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    expect(await screen.findByText(/selecione uma geometria/i)).toBeInTheDocument();
    expect(createZoneMock).not.toHaveBeenCalled();
  });

  it('debounces filter search', async () => {
    renderApp();

    const filterInput = await screen.findByLabelText(/Filtro por nome/i);
    fireEvent.change(filterInput, { target: { value: 'park' } });

    await waitFor(() => {
      expect(listZonesMock).toHaveBeenCalledTimes(2);
    });
    expect(listZonesMock).toHaveBeenLastCalledWith('park');
  });

  it('creates zone, reloads list and resets geometry', async () => {
    renderApp();

    const filterInput = await screen.findByLabelText(/Filtro por nome/i);
    fireEvent.change(filterInput, { target: { value: 'park' } });
    await waitFor(() => expect(listZonesMock).toHaveBeenCalledTimes(2), { timeout: 2000 });
    listZonesMock.mockClear();

    fireEvent.click(screen.getByText('select-geometry'));
    expect(screen.getByTestId('selected-geometry').textContent).toBe('Point');

    fireEvent.click(screen.getByText(/Nova Zona/i));
    await userEvent.type(screen.getByLabelText('Nome'), ' New Zone ');
    await userEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => expect(createZoneMock).toHaveBeenCalledTimes(1));
    expect(createZoneMock).toHaveBeenCalledWith({
      name: 'New Zone',
      type: 'RESIDENTIAL',
      geometry: { type: 'Point', coordinates: [3, 4] },
    });
    await waitFor(() => expect(listZonesMock).toHaveBeenCalledTimes(1));
    expect(listZonesMock).toHaveBeenLastCalledWith('park');
    expect(screen.getByTestId('selected-geometry').textContent).toBe('none');

    vi.useFakeTimers();
    await act(() => {
      vi.advanceTimersByTime(2800);
    });
    vi.useRealTimers();
  });

  it('handles loadZones errors and recovers on next fetch', async () => {
    listZonesMock.mockRejectedValueOnce(new Error('Ops'));
    renderApp();

    expect(await screen.findByText(/Ops/)).toBeInTheDocument();

    listZonesMock.mockResolvedValue([]);
    const filterInput = screen.getByLabelText(/Filtro por nome/i);
    fireEvent.change(filterInput, { target: { value: 'again' } });

    await waitFor(() => expect(listZonesMock).toHaveBeenCalledTimes(2), { timeout: 2000 });
  });

  it('creates zone with no filter and reloads without query', async () => {
    renderApp();
    await waitFor(() => expect(listZonesMock).toHaveBeenCalledTimes(1));
    listZonesMock.mockClear();

    fireEvent.click(screen.getByText('select-geometry'));
    fireEvent.click(screen.getByText(/Nova Zona/i));
    await userEvent.type(screen.getByLabelText('Nome'), ' Another Zone ');
    await userEvent.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => expect(createZoneMock).toHaveBeenCalledTimes(1));
    expect(listZonesMock).toHaveBeenCalledWith(undefined);
  });

  it('runs filter effect for empty filter on mount', async () => {
    renderApp();

    await waitFor(() => expect(listZonesMock).toHaveBeenCalledTimes(1), { timeout: 1500 });
  });
});
