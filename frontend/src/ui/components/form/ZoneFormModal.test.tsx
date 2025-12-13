import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZoneFormModal } from './ZoneFormModal';
import { ZoneType } from '../../../domain/zones/models';

const pointGeometry = { type: 'Point' as const, coordinates: [1, 2] as [number, number] };

describe('ZoneFormModal', () => {
  it('returns null when closed', () => {
    const { container } = render(
      <ZoneFormModal open={false} onClose={vi.fn()} onSubmit={vi.fn()} geometry={null} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('validates required fields', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Preencha nome, tipo e selecione uma geometria no mapa.'));
    render(<ZoneFormModal open onClose={vi.fn()} onSubmit={onSubmit} geometry={null} />);

    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: /Salvar/i }));
    });
    expect(
      await screen.findByText(/Preencha nome, tipo e selecione uma geometria/i),
    ).toBeInTheDocument();
  });

  it('renders polygon status text when geometry is a polygon', () => {
    const polygon = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 0],
        ],
      ],
    };

    render(
      <ZoneFormModal open onClose={vi.fn()} onSubmit={vi.fn()} geometry={polygon as any} />,
    );

    expect(screen.getByText(/Polygon \(via desenho\)/i)).toBeInTheDocument();
  });

  it('shows error message passed via props', () => {
    render(
      <ZoneFormModal
        open
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        geometry={pointGeometry}
        errorMessage="Erro externo"
      />,
    );

    expect(screen.getByText(/Erro externo/i)).toBeInTheDocument();
  });

  it('submits data and closes', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ZoneFormModal open onClose={onClose} onSubmit={onSubmit} geometry={pointGeometry} />,
    );

    await userEvent.type(screen.getByLabelText('Nome'), 'Test Zone');
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: ZoneType.INDUSTRIAL } });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Zone',
      type: ZoneType.INDUSTRIAL,
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows error when submit fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error(''));

    render(
      <ZoneFormModal open onClose={vi.fn()} onSubmit={onSubmit} geometry={pointGeometry} />,
    );

    await userEvent.type(screen.getByLabelText('Nome'), 'Broken');
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    });

    expect(await screen.findByText(/Erro ao criar zona/i)).toBeInTheDocument();
  });
});
