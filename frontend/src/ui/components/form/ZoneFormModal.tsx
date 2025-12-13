/* istanbul ignore file */
import { FormEvent, useEffect, useState } from 'react';
import { GeoJSONGeometry, ZoneType } from '../../../domain/zones/models';
import { ErrorBanner } from '../feedback/ErrorBanner';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; type: ZoneType }) => Promise<void>;
  geometry: GeoJSONGeometry | null;
  errorMessage?: string | null;
};

export function ZoneFormModal({ open, onClose, onSubmit, geometry, errorMessage }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ZoneType>(ZoneType.RESIDENTIAL);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName('');
      setType(ZoneType.RESIDENTIAL);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  if (!open) return null;

  /* istanbul ignore next */
  const geometryLabel = geometry
    ? `${geometry.type} ${geometry.type === 'Point' ? '(via clique)' : '(via desenho)'}`
    : 'Nenhuma. Clique ou desenhe no mapa.';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), type });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar zona');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Nova Zona</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Nome
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Tipo
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ZoneType)}
              required
            >
              {Object.values(ZoneType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <div className="status">
            Geometria selecionada:{' '}
            {geometryLabel}
          </div>
          {(error || errorMessage) && <ErrorBanner message={error || errorMessage || ''} />}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="button secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
        <p style={{ fontSize: '0.9rem', margin: 0 }}>
          Selecione o modo Point, Polygon ou Circle no mapa, clique ou desenhe e depois salve.
        </p>
      </div>
    </div>
  );
}
