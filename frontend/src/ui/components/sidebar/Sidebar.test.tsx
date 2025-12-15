import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { ZoneType } from '../../../domain/zones/models';

const sampleZones = [
  { id: '1', name: 'Central Park', type: ZoneType.RESIDENTIAL, geometry: { type: 'Point', coordinates: [0, 0] } },
  { id: '2', name: 'Downtown', type: ZoneType.COMMERCIAL, geometry: { type: 'Point', coordinates: [1, 1] } },
];

describe('Sidebar', () => {
  it('renders zones and handles filter and new zone', () => {
    const onFilterChange = vi.fn();
    const onNewZone = vi.fn();

    render(
      <Sidebar filter="initial" onFilterChange={onFilterChange} zones={sampleZones as any} onNewZone={onNewZone} />,
    );

    expect(screen.getByLabelText(/Filtro por nome/i)).toHaveValue('initial');
    expect(screen.getByText('Central Park')).toBeInTheDocument();
    expect(screen.getByText(/downtown/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Filtro por nome/i), { target: { value: 'park' } });
    expect(onFilterChange).toHaveBeenCalledWith('park');

    fireEvent.click(screen.getByText(/Nova Zona/i));
    expect(onNewZone).toHaveBeenCalledTimes(1);
  });

  it('marks the active row when clicked', () => {
    const onFilterChange = vi.fn();
    const onNewZone = vi.fn();

    render(
      <Sidebar filter="initial" onFilterChange={onFilterChange} zones={sampleZones as any} onNewZone={onNewZone} />,
    );

    const downtownButton = screen.getByText(/Downtown/i).closest('button');
    expect(downtownButton).not.toBeNull();
    if (downtownButton) {
      expect(downtownButton).not.toHaveClass('selected');
      fireEvent.click(downtownButton);
      expect(downtownButton).toHaveClass('selected');
    }
  });
});
